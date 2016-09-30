var Twit = require('twit')

var T = new Twit({
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

function startAPITweetload(){
	setTimeout(function(){
		load();
		startAPITweetload();
	},5000);
}

function load(){
	var teams = "futbol #saprissa OR #lda OR #heredia OR #cartago OR #perezzeledon OR #carmelita ";
	console.log(query);
	T.get('search/tweets', { q: teams, count: 4000 }, function(err, data, response) {
		//console.log(data)
		if(data.statuses.length===0) return [];
	  var parsed =  data.statuses.map(function(tweet){
	  	return {
	  		user: tweet.user.screen_name,
	  		text: tweet.text
	  	};
	  });
	  console.log(parsed);
	  
	  rethink.persist(parsed);
	});
}

