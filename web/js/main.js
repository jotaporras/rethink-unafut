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
  methods: []
});

socket.on('tweet', function(tweet){
	console.log("received ",tweet);
  	vm.tweets.push(tweet.latestTweet);
  	vm.teams = tweet.table;
});

