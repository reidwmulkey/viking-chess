
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = [];
var nextGameId = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log(socket.id + ' user connected');

	if(getOpenGameId()){
		getGameForId(getOpenGameId()).blackPlayer = socket.id;
	}
	else {
		games.push({whitePlayer: socket.id, blackPlayer: null, isBlacksTurn: true, gameId: nextGameId});
		nextGameId++;
	}

	socket.on('make-move', function(move){

		console.log(move);

		var isBlacksTurn = getGameForSocketId(socket.id).isBlacksTurn;
		if(isBlacksTurn && move.color !== 'black' || !isBlacksTurn && move.color !== 'white'){
			return;
		}

		io.emit('move-made', move);

		getGameForSocketId(socket.id).isBlacksTurn = !getGameForSocketId(socket.id).isBlacksTurn;
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getGameForSocketId(socketId){
	
	for(var i = 0; i < games.length; i++){
		if(games[i].whitePlayer === socketId || games[i].blackPlayer === socketId){
			return games[i];
		}
	}

	return null;
}

function getGameForId(gameId){

	for(var i = 0; i < games.length; i++){
		if(games[i].gameId === gameId){
			return games[i];
		}
	}

	return null;
}
    
function getOpenGameId(){

	for(var i = 0; i < games.length; i++){
		if(games[i].whitePlayer !== null || games[i].blackPlayer !== null){
			return games[i].gameId;
		}
	}

	return null;
}
