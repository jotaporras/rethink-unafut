var rethinkdb = require('rethinkdb');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var tweetParser = require(__dirname+"/src/tweet_parser");

// Express app
app.use(bodyParser.json());
app.use(cors());

// RethinkDB settings
var dbHost = 'localhost';
var dbPort = 28015;
var dbName = 'unafut';
var tableName = 'tweets';

// RethinkDB queries
var lastestTweetQuery = rethinkdb.db(dbName).table(tableName)
  .orderBy({index: rethinkdb.desc('timestamp')}).limit(1);
var leaderboardQuery = rethinkdb.db(dbName).table(tableName)
  .group({index: 'tags'}).count();


// Inserts a tweet
app.post('/tweets', function (req, res) {
  // Parse tweet
  var parsedTweet = {
    user: req.body.latestTweet.user,
    message: req.body.latestTweet.text,
    tags: getHashtags(req.body.latestTweet.text),
    timestamp: Date.now()
  };
  // Insert parsed tweet
  rethinkdb.connect({host: dbHost, port: dbPort})
  .then(function(conn) {
      return rethinkdb.db(dbName).table(tableName)
        .insert(parsedTweet).run(conn);
  }).then(function () {
    res.status(201).end();
  }).error(function (err) {
    console.log('Error:', err);
    res.status(500).end();
  });
});

// Handle new socket connections
io.on('connection', function (socket) {
  console.log("connecting to socket");
  rethinkdb.connect({host: dbHost, port: dbPort})
  .then(function (conn) {
    return sendInitialMessage(conn, socket, function () {
      sendEvents(conn, socket);
    });
  })
  .error(function (err) {
    console.log(err);
  });
});

// Serve static content
app.use(express.static('web'));

// Set up database, table and indexes
function setupDatabase(startListener) {
  console.log("Setting up database")
  rethinkdb.connect({host: dbHost, port: dbPort})
  .then(function (conn) {
    // Create database
    return rethinkdb.dbCreate(dbName).run(conn)
    .then(function () {
      // Create table
      return rethinkdb.db(dbName).tableCreate(tableName).run(conn);
    })
    .then(function () {
      // Create tags index
      return rethinkdb.db(dbName).table(tableName)
        .indexCreate('tags', {multi: true}).run(conn);
    }).then(function () {
      // Create timestamp index
      return rethinkdb.db(dbName).table(tableName)
        .indexCreate('timestamp').run(conn);
    }).then(function () {
      startListener();
    });
  })
  .error(function (err) {
    // Assume that the database has already been created
    startListener();
  })
}

// Setup databse
setupDatabase(function () {
  // Start HTTP server

  http.listen(3000, function() {
    console.log('Listening on port 3000');
    console.log("loading tweets")
    tweetParser.startAPITweetload();
  })
})


// Gets the hashtags from a string
function getHashtags(tweet) {
  return tweet.toLowerCase().match(/#(\w+)/g).map(function (str) {
    // Remove pound symbol
    return str.substring(1);
  })
}

// Sends the initial message upon connection
function sendInitialMessage(conn, socket, callback) {
  lastestTweetQuery.run(conn)
  .then(function (tweetCursor) {
    tweetCursor.toArray(function (err, tweets) {
      // Default user and text
      var user = "";
      var text = "";
      // User and text value if the database is not empty
      if (tweets.length > 0) {
        user = tweets[0].user;
        text = tweets[0].message;
      }
      // Send tweet
      sendLatestTweet(conn, socket, user, text);
      callback();
    });
  })
  .error(function (err) {
    console.log(err);
  })
}

// Sends events continously to a socket
function sendEvents(conn, socket) {
  lastestTweetQuery.changes().run(conn)
  .then(function (cursor) {
    console.log("received something");
    cursor.each(function (err, data) {
      var tweetUser = data.new_val.user
      var tweetText = data.new_val.message
      sendLatestTweet(conn, socket, tweetUser, tweetText);
    });
  })
  .error(function (err) {
    console.log(err);
  });
}

// Sends a tweet event message to the client
function sendLatestTweet(conn, socket, user, text) {
  console.log("Sending latest tweet")
  leaderboardQuery.run(conn)
    .then(function (leaderboard) {
      // Transform scores
      var scores = leaderboard.map(function (grouping) {
        return {
          team: grouping.group,
          score: grouping.reduction
        }
      })
      // Build tweet message
      var tweetMsg = {
        scores: scores,
        latestTweet: {
          user: user,
          text: text
        }
      };
      // Send message
      socket.emit('tweet', tweetMsg);
    });
}
