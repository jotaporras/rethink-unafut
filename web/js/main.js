var socket = io();

var vm = new Vue({
  el: '#app',
  data: {
    tweets: [
      { user: "John",text: 'Foo' },
      { user: "James",text: 'Bar' }
    ],
    teams: [
    	{name: "Heredia",score: 0}
    ]
  },
  methods: {
  	parse: function(tweetText){
  		var tokens = tweetText.split(" ");
  		var parsed = tokens.map(function(word){
  			if(word.charAt(0) === "#")
  				return  "<b style='color:blue'>" + word + '</b>';
  			else return word;
  		});
  		return parsed.join(" ");

  	}
  }
});

socket.on('tweet', function(tweet){
	console.log("received ",tweet);
  	vm.tweets.push(tweet.latestTweet);
  	vm.teams = tweet.table;
});

