var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static('web'));

app.get('/', function(req, res){
	res.sendFile(path.resolve('web/index.html'));
});

io.on('connection', function(socket){
	//Send initial tweet
	var initialTweet = {table:[],latestTweet:{user:"CLagos9",text:"Que Dios tenga a #Heredia en su santa gloria"}};
	io.emit("tweet",initialTweet);
	socket.on('tweet', function(msg){
		var sampleTweet = {
			scores: [
			{team:"Heredia",score: 0},
			{team:"Saprissa",score: 0},
			{team:"LDA",score: 0}
			],
			latestTweet: {
				user: "JotaPorras",
				text: "Ayyy #Saprissa campeon, le duela a quien le duela!!!"
			}
		};
		io.emit("tweet",sampleTweet);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
	io.emit("chat message",{user:"Jay",text:"something"});
});
