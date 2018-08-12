
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = [];
var nextGameId = 0;

//app.get('/', function(req, res){
//  res.sendFile(__dirname + '/index.html');
//});

app.get('/*', function(req, res){
	res.sendFile(__dirname + req.url);
});

io.on('connection', function(socket){
	console.log(socket.id + ' user connected');

	console.log('open game id: ' + getOpenGameId());
	
	if(getOpenGameId() !== null){
		getGameForId(getOpenGameId()).blackPlayer = socket.id;
		assignPlayerColor(socket.id, 'black');
	}
	else {
		games.push({whitePlayer: socket.id, blackPlayer: null, isBlacksTurn: true, gameId: nextGameId});
		assignPlayerColor(socket.id, 'white');
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

function assignPlayerColor(socketId, color){
	
	console.log('assigned ' + color + ' to socket: ' + socketId);
	io.to(socketId).emit('assigned-color', color);
}

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
