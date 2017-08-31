/**
 * http://usejsdoc.org/
 */

var bgCanvas, bgContext;	
var fgCanvas, fgContext;	

const BOARD_SIZE = 9;
const ARC_LENGTH = 2 * Math.PI;

var board;
var selectedPiece, king;
var myColor = null;
var isBlacksTurn = true;
var HEIGHT, WIDTH, SQUARE_DIM; // to deal with scope these have to be variables :/
var PIECE_OFFSET, PIECE_RADIUS;

window.onload = function(){
	
	bgCanvas = document.getElementById("bg-canvas");
	bgContext = bgCanvas.getContext("2d");
	
	fgCanvas = document.getElementById("fg-canvas");
	fgContext = fgCanvas.getContext("2d");

	HEIGHT = bgCanvas.clientHeight;
	WIDTH = bgCanvas.clientWidth;
	
	SQUARE_DIM = HEIGHT / BOARD_SIZE;

	PIECE_OFFSET = SQUARE_DIM / 2;
	PIECE_RADIUS = PIECE_OFFSET - 3;

	MARKER_OFFSET = SQUARE_DIM / 2;
	MARKER_RADIUS = PIECE_RADIUS / 3;

	document.onmouseup = onMouseUp;
	
	drawStrokedGrid();
	resetBoard();
}

function drawStrokedGrid(){
	
	bgContext.strokeStyle = "black";
	
	for(var i = 0; i < HEIGHT; i+= SQUARE_DIM){
		for(var j = 0; j < WIDTH; j+= SQUARE_DIM){
			
			bgContext.fillStyle = "#aaa";
			
			bgContext.rect(i, j, SQUARE_DIM, SQUARE_DIM);
			bgContext.fill();
			bgContext.stroke();
		}
	}
}

function drawFilledGrid(){
	
	var shouldBeBlack = true;
	
	for(var i = 0; i < HEIGHT; i+= SQUARE_DIM){
		for(var j = 0; j < WIDTH; j+= SQUARE_DIM){
			bgContext.fillStyle = shouldBeBlack ? "grey" : "green";
			bgContext.fillRect(i, j, SQUARE_DIM, SQUARE_DIM);
			
			shouldBeBlack = !shouldBeBlack;
		}
	}

//	bgContext.strokeStyle = "black"; 
//	bgContext.strokeRect(0, 0, WIDTH, HEIGHT);
}

function resetBoard(){
	
	board = new Array(BOARD_SIZE);
	for(var i = 0; i < BOARD_SIZE; i++){
		board[i] = new Array(BOARD_SIZE);
	}
	
	// top row of black pieces
	createPiece(3, 0, "black");
	createPiece(4, 0, "black");
	createPiece(5, 0, "black");
	createPiece(4, 1, "black");

	// right row of black pieces
	createPiece(8, 3, "black");
	createPiece(8, 4, "black");
	createPiece(8, 5, "black");
	createPiece(7, 4, "black");

	// bottom row of black pieces
	createPiece(3, 8, "black");
	createPiece(4, 8, "black");
	createPiece(5, 8, "black");
	createPiece(4, 7, "black");

	// left row of black pieces
	createPiece(0, 3, "black");
	createPiece(0, 4, "black");
	createPiece(0, 5, "black");
	createPiece(1, 4, "black");
	
	//white pieces
	createPiece(2, 4, "white");
	createPiece(3, 4, "white");
	createPiece(5, 4, "white");
	createPiece(6, 4, "white");

	createPiece(4, 2, "white");
	createPiece(4, 3, "white");
	createPiece(4, 5, "white");
	createPiece(4, 6, "white");
	
	//king
	createPiece(4, 4, "white", true);
	
	drawBoard();
}

function createPiece(x, y, color, isKing){
	
	board[x][y] = {x: x, y: y, color: color, type: "piece", isKing: isKing === true};
}

function drawBoard(){

	fgContext.clearRect(0, 0, HEIGHT, WIDTH);

	for(var i = 0; i < board.length; i++){
		for(var j = 0; j < board[i].length; j++){
			if(board[i][j]){
				drawSquare(board[i][j]);
			}
		}
	}
}

function drawSquare(square){
	//	x, y, color
	
	var xPos = square.x * SQUARE_DIM;
	var yPos = square.y * SQUARE_DIM;
	
	if(square.isKing){
		king = square;
		fgContext.fillStyle = "green";
	}
	else {
		fgContext.fillStyle = square.color;
	}
	
	fgContext.beginPath();
	if(square.type === "piece"){
		fgContext.arc(xPos + PIECE_OFFSET, yPos + PIECE_OFFSET, PIECE_RADIUS, 0, ARC_LENGTH);
	}
	else {
		fgContext.arc(xPos + MARKER_OFFSET, yPos + MARKER_OFFSET, MARKER_RADIUS, 0, ARC_LENGTH);
	}
	fgContext.fill();
}

function determineCaptures(piece){
	
	//check left
	if(piece.x - 1 >= 0){
		var pieceToLeft = board[piece.x - 1][piece.y];
		//if piece to left is opposite color
		if(pieceToLeft && piece.color !== pieceToLeft.color){
			if(isCorner(pieceToLeft.x - 1, pieceToLeft.y) && !pieceToLeft.isKing){
				board[pieceToLeft.x][pieceToLeft.y] = null;
			}
			//check is same color piece is flanking opposite color piece
			else if(pieceToLeft.x - 1 >= 0){
				var flankingPiece = board[pieceToLeft.x - 1][pieceToLeft.y];
				if(flankingPiece && flankingPiece.color === piece.color && !pieceToLeft.isKing){
					board[pieceToLeft.x][pieceToLeft.y] = null;
				}
			}
		}
	}
	
	// check right 
	if(piece.x + 1 < BOARD_SIZE){
		var pieceToRight = board[piece.x + 1][piece.y];
		// if piece to right is opposite color
		if(pieceToRight && piece.color !== pieceToRight.color){
			// if capturing against a corner
			if(isCorner(pieceToRight.x + 1, pieceToRight.y) && !pieceToRight.isKing){
				board[pieceToRight.x][pieceToRight.y] = null;
			}
			// check is same color piece is flanking opposite color piece
			else if(pieceToRight.x + 1 < BOARD_SIZE){
				var flankingPiece = board[pieceToRight.x + 1][pieceToRight.y];
				if(flankingPiece && flankingPiece.color === piece.color && !pieceToRight.isKing){
					board[pieceToRight.x][pieceToRight.y] = null;
				}
			}
		}
	}

	//check up
	if(piece.y - 1 >= 0){
		var pieceAbove = board[piece.x][piece.y - 1];
		//if piece above is opposite color
		if(pieceAbove && piece.color !== pieceAbove.color){
			if(isCorner(pieceAbove.x, pieceAbove.y - 1) && !pieceAbove.isKing){
				board[pieceAbove.x][pieceAbove.y] = null;
			}
			//check is same color piece is flanking opposite color piece
			else if(pieceAbove.y - 1 >= 0){
				var flankingPiece = board[pieceAbove.x][pieceAbove.y - 1];
				if(flankingPiece && flankingPiece.color === piece.color && !pieceAbove.isKing){
					board[pieceAbove.x][pieceAbove.y] = null;
				}
			}
		}
	}
	
	//check down 
	if(piece.y + 1 < BOARD_SIZE){
		var pieceBelow = board[piece.x][piece.y + 1];
		//if piece below is opposite color
		if(pieceBelow && piece.color !== pieceBelow.color){
			if(isCorner(pieceBelow.x, pieceBelow.y + 1) && !pieceBelow.isKing){
				board[pieceBelow.x][pieceBelow.y] = null;
			}
			//check is same color piece is flanking opposite color piece
			else if(pieceBelow.y + 1 < BOARD_SIZE){
				var flankingPiece = board[pieceBelow.x][pieceBelow.y + 1];
				if(flankingPiece && flankingPiece.color === piece.color && !pieceBelow.isKing){
					board[pieceBelow.x][pieceBelow.y] = null;
				}
			}
		}
	}
}

function kingIsSurrounded(){
	
	var noMoveLeft = king.x !== 0 ? board[king.x - 1][king.y] &&  board[king.x - 1][king.y].color !== king.color : true;
	var noMoveRight = king.x !== BOARD_SIZE - 1 ? board[king.x + 1][king.y] &&  board[king.x + 1][king.y].color !== king.color : true;
	var noMoveBelow = king.y !== BOARD_SIZE - 1 ? board[king.x][king.y + 1] &&  board[king.x][king.y + 1].color !== king.color : true;
	var noMoveAbove = king.y !== 0 ? board[king.x][king.y - 1] &&  board[king.x][king.y - 1].color !== king.color : true;
	
	return noMoveLeft && noMoveRight && noMoveBelow && noMoveAbove;
}

function kingIsInTheCorner(){
	return isCorner(king.x, king.y);
}

function blackWinsTheGame(){
	console.log('black wins!');
}

function whiteWinsTheGame(){
	console.log('white wins!');
}

function onMouseUp(event){
	
	var x = Math.floor(event.clientX / SQUARE_DIM);
	var y = Math.floor(event.clientY / SQUARE_DIM);
	
	var square = board[x][y];
	if(selectedPiece){
		// if clicked on a marker then move the piece and change turns
		if(square && square.type === "marker" && ((selectedPiece.color === "white" && isBlacksTurn === false && myColor === 'white') || (selectedPiece.color === "black" && isBlacksTurn === true && myColor === 'black'))){
			makeMove({color: selectedPiece.color, x: x, y: y, isKing: selectedPiece.isKing, removePiece: selectedPiece});
			selectedPiece = null;
		}
		else{
			selectedPiece = null;
			removeMarkers();
			drawBoard();
		}
	}
	else {
		if(square && square.type === "piece" && ((square.color === "white" && isBlacksTurn === false) || (square.color === "black" && isBlacksTurn === true))){
			// clicked on a piece and now need to draw markers for possible moves
			var markerCount = addMarkers(square);
			if(markerCount > 0){
				selectedPiece = board[x][y];
				drawBoard();
			}
		}
	}
}

function isCorner(x, y){
	
	var topLeft = x === 0 && y === 0;
	var topRight = x === BOARD_SIZE - 1 && y === 0;
	var bottomLeft = x === 0 && y === BOARD_SIZE - 1;
	var bottomRight = x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1;
	
	return topLeft || topRight || bottomLeft || bottomRight;
}

function removeMarkers(){
	for(var i = 0; i < BOARD_SIZE; i++){
		for(var j = 0; j < BOARD_SIZE; j++){
			if(board[i][j] && board[i][j].type === "marker"){
				board[i][j] = null;
			}
		}	
	}
}

function addMarkers(square){
	
	var shouldDrawLeft = true, shouldDrawUp = true, shouldDrawRight = true, shouldDrawDown = true;
	var markerCount = 0;
	
	var x = square.x - 1, y = square.y;
	while(shouldDrawLeft){
		if(x < 0 || board[x][y]){
			shouldDrawLeft = false;
			break;
		}
		board[x][y] = {x: x, y: y, color: square.color, type: "marker", isKing: false};
		x--;
		markerCount++;
	}

	x = square.x + 1, y = square.y;
	while(shouldDrawRight){
		if(x >= BOARD_SIZE || board[x][y]){
			shouldDrawRight = false;
			break;
		}
		board[x][y] = {x: x, y: y, color: square.color, type: "marker", isKing: false};
		x++;
		markerCount++;
	}
	
	x = square.x, y = square.y - 1;
	while(shouldDrawUp){
		if(y < 0 || board[x][y]){
			shouldDrawUp = false;
			break;
		}
		board[x][y] = {x: x, y: y, color: square.color, type: "marker", isKing: false};
		y--;
		markerCount++;
	}
	
	x = square.x, y = square.y + 1;
	while(shouldDrawDown){
		if(y >= BOARD_SIZE || board[x][y]){
			shouldDrawDown = false;
			break;
		}
		board[x][y] = {x: x, y: y, color: square.color, type: "marker", isKing: false};
		y++;
		markerCount++;
	}
	
	//so only the king can move into the corners
	if(!square.isKing && !kingIsInTheCorner()){
		board[0][0] = null;
		board[0][BOARD_SIZE - 1] = null;
		board[BOARD_SIZE - 1][0] = null;
		board[BOARD_SIZE - 1][BOARD_SIZE - 1] = null;
	}
	
	return markerCount;
}
