var socket = io();
//var button = document.getElementById("make-move");

function makeMove(move){

	console.log('making move');

	if(isBlacksTurn && move.color !== 'black' || !isBlacksTurn && move.color !== 'white'){
		console.error('tried making a move on wrong turn: ', move.color, isBlacksTurn);
		return;
	}

	socket.emit('make-move', move);
}

socket.on('assigned-color', function(color){
	console.log('assigned color: ' + color);
	myColor = color;
});

socket.on('move-made', function(move){
	console.log('a move was made', move);
	
	if(isBlacksTurn && move.color !== 'black' || !isBlacksTurn && move.color !== 'white'){
		console.error('tried making a move on wrong turn: ', move.color, isBlacksTurn);
	}
	else {
		board[move.x][move.y] = {x: move.x, y: move.y, color: move.color, type: "piece", isKing: move.isKing};
		determineCaptures(board[move.x][move.y]);
		board[move.removePiece.x][move.removePiece.y] = null;
		isBlacksTurn = !isBlacksTurn;

		removeMarkers();
		drawBoard();
		
		if(kingIsInTheCorner()){
			whiteWinsTheGame();
		}
		else if(kingIsSurrounded()){
			blackWinsTheGame();
		}
	}
});