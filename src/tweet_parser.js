var Twit = require('twit')
var rethinkdb = require('rethinkdb');

var dbHost = 'localhost';
var dbPort = 315;
var dbName = 'unafut';
var tableName = 'tweets';

var T = new Twit({
  consumer_key:         'AWoXoDy1KkUJzcG39h4xoQ',
  consumer_secret:      'LwL0zaqEUhPizf1p77avsOly9tlvPmYEuGxbeU6jUo',
  access_token:         '107188476-xvNGNA7KDJ4nYuG78zi1XUxZacuJJOiF6pQs9ear',
  access_token_secret:  'yjvKB5to4BEm1WIaaMyxfJU6JIBooEQtQDa2szU66g',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

module.exports = {
	startAPITweetload: function(){
		setTimeout(function(){
			console.log("called loading tweets")
			load();
		},1000);
	}
};


// Teams to track
var teams = [
  'carmelita',
  'cartago',
  'heredia',
  'lda',
  'perezzeledon',
  'saprissa'
];

// Gets the hashtags from a string
function getHashtags(tweet) {
  return tweet.toLowerCase().match(/#(\w+)/g)
  .map(function (str) {
    // Remove pound symbol
    return str.substring(1);
  })
  .filter(function (hashtag) {
    // Remove invalid teams
    return teams.indexOf(hashtag) >= 0;
  });
}


function load(){
	var teams = "futbol #saprissa OR #lda OR #heredia OR #cartago OR #perezzeledon OR #carmelita ";
	console.log(teams);
	T.get('search/tweets', { q: teams, count: 5000 }, function(err, data, response) {
		//console.log(data)
		if(data.statuses.length===0) return [];
	  var parsed =  data.statuses.map(function(tweet){
	  	return {
	  		user: tweet.user.screen_name,
	  		message: tweet.text,
	  		tags: getHashtags(tweet.text),
	  		timestamp: Date.now()
	  	};
	  });
	  //console.log(parsed);
	  var chosen = parsed[Math.floor(Math.random()*parsed.length)];
	  rethinkdb.connect({host: dbHost, port: dbPort})
	  .then(function(conn) {
	      return rethinkdb.db(dbName).table(tableName)
	        .insert(chosen).run(conn);
	  }).then(function () {
	    //res.status(201).end();
	    module.exports.startAPITweetload();
	  }).error(function (err) {
	    console.log('Error:', err);
	    //res.status(500).end();
	  });

	  /*parsed.forEach(function(parsedTweet){
	  		console.log("storing");

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
	  });*/

	  
	  //TODO: rethink.save(parsed);
	});
}