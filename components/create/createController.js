soccerDraw.factory('play-creation', ['p5', function(p5) {
	return function (sketch) {

		/* Globals used. */
		var players = [];
		var recording = false;
		var playing = false;
		var currFrame = -1;
		var framesToShow = 300;
		var numPlayers = 0;
		var mousePressStartX = -100;
		var mousePressStartY = -100;
		var mouseCurrentlyPressed = false;
		var playbackType = 'None';

		/* Called once at loading of page. Sets up the canvas and necessary buttons. */
		sketch.setup = function () {
			canvas = sketch.createCanvas(1200, 600);
			canvas.position(($(window).width() - 1200) / 2, 50);
			sketch.frameRate(60);

			addYourPlayerButton = sketch.createButton('Add Your Player');
			addYourPlayerButton.position(10, 10);
			addYourPlayerButton.mousePressed(addYourPlayer);

			addOpposingPlayerButton = sketch.createButton('Add Opposing Player');
			addOpposingPlayerButton.position(20 + addYourPlayerButton.width, 10);
			addOpposingPlayerButton.mousePressed(addOpposingPlayer);

			clearAllPlayersButton = sketch.createButton('Clear Players');
			clearAllPlayersButton.position(30 + addYourPlayerButton.width + addOpposingPlayerButton.width, 10);
			clearAllPlayersButton.mousePressed(clearAllPlayers);

			clearHistoryButton = sketch.createButton('Clear Player History');
			clearHistoryButton.position(40 + addYourPlayerButton.width + addOpposingPlayerButton.width + clearAllPlayersButton.width, 10);
			clearHistoryButton.mousePressed(clearHistory);

			recordCheckbox = sketch.createCheckbox('Record', false);
			recordCheckbox.position(50 + addYourPlayerButton.width + addOpposingPlayerButton.width + clearAllPlayersButton.width + clearHistoryButton.width, 10);
			recordCheckbox.changed(record);

			playButton = sketch.createButton('Play');
			playButton.position($(window).width() - 10 - playButton.width, 10);
			playButton.mousePressed(play);

			playbackTypeSelect = sketch.createSelect();
			playbackTypeSelect.option('None');
			playbackTypeSelect.option('Arrows');
			playbackTypeSelect.option('Basic Animation');
			playbackTypeSelect.option('Advanced Animation');
			playbackTypeSelect.option('Basic Animation with Trails');
			playbackTypeSelect.option('Advanced Animation with Trails');
			playbackTypeSelect.changed(setPlaybackType);
			playbackTypeSelect.width = 250;
			playbackTypeSelect.position($(window).width() - 20 - playButton.width - playbackTypeSelect.width, 10);

			playbackTimeSelect = sketch.createSelect();
			playbackTimeSelect.option('1');
			playbackTimeSelect.option('1.5');
			playbackTimeSelect.option('2');
			playbackTimeSelect.option('2.5');
			playbackTimeSelect.option('3');
			playbackTimeSelect.option('3.5');
			playbackTimeSelect.option('4');
			playbackTimeSelect.option('4.5');
			playbackTimeSelect.option('5');
			playbackTimeSelect.option('5.5');
			playbackTimeSelect.option('6');
			playbackTimeSelect.option('6.5');
			playbackTimeSelect.option('7');
			playbackTimeSelect.option('7.5');
			playbackTimeSelect.option('8');
			playbackTimeSelect.option('8.5');
			playbackTimeSelect.option('9');
			playbackTimeSelect.option('9.5');
			playbackTimeSelect.option('10');
			playbackTimeSelect.changed(setPlaybackTime);
			playbackTimeSelect.width = 50;
			playbackTimeSelect.position($(window).width() - 30 - playButton.width - playbackTypeSelect.width - playbackTimeSelect.width, 10);

			function clearAllPlayers() {
				delete players;
				players = [];
			}

			function addYourPlayer() {
				var player = new Player(sketch, true, numPlayers);
				numPlayers++;
				players.push(player);
			}

			function addOpposingPlayer() {
				var player = new Player(sketch, false, numPlayers);
				numPlayers++;
				players.push(player);
			}

			function record() {
				if (this.checked()) {
					recording = true;
				} else {
					recording = false;
				}
			}

			function setPlaybackType() {
				playbackType = playbackTypeSelect.value();
			}

			function clearHistory() {
				for (var i = 0; i < players.length; i++) {
					players[i].clearHistory();
				}
			}

			function setPlaybackTime() {
				framesToShow = parseFloat(playbackTimeSelect.value()) * 60;
			}

			function play() {
				recording = false;
				recordCheckbox.value = false;
				playing = true;
				currFrame = 0;
			}
		}

		/* Called on every frame. Handles drawing on screen. */
		sketch.draw = function () {
			drawInitialField();
			if (playing) {
				handlePlayAnimation();
			} else {
				handleDragAndDrop();
				handleRecording();
			}
		}

		function handlePlayAnimation() {
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				var history = player.getHistory();
				var currPosition;
				if (history.length === 0) {
					currPosition = player.getPosition();
				} else {
					var index = Math.round((currFrame/framesToShow) * history.length);
					if (index >= history.length) index = history.length - 1;
					currPosition = history[index];
				}
				player.move(currPosition.x, currPosition.y);
			}
			currFrame++;
			if (currFrame > framesToShow) {
				playing = false;
				currFrame = -1;
			}
		}

		function handleRecording() {
			for (var i = 0; i < players.length; i++) {
				var history = players[i].getHistory();
				for (var j = 0; j < history.length; j++) {
					var vec = history[j];
					if (j !== 0) {
						if (players[i].isUserTeam()) {
							sketch.stroke(232, 222, 42);
							sketch.fill(232, 222, 42);
						} else {
							sketch.stroke(17,42,38);
							sketch.fill(17,42,38);
						}
						sketch.strokeWeight(3);
						sketch.line(history[j-1].x, history[j-1].y, history[j].x, history[j].y);
					}
				}
			}
		}

		function handleDragAndDrop() {
			var moved = false;
			for (var x = 0; x < players.length; x++) {
				var player = players[x];

				//Only one player should be allowed to be dragged at a time
				if (moved === false) moved = handleDragMovement(player, recording);
				player.display();
			}
		}

		/* Sets up the soccer field on the screen. */
		function drawInitialField() {
			sketch.background("green");
			sketch.stroke(0, 0, 0);
			sketch.strokeWeight(2);
			sketch.noFill();

			//Corner flags
			sketch.arc(0, 0, 30, 30, 0, 1.57);
			sketch.arc(1200, 0, 30, 30, 1.57, 3.14);

			//sidelines
			sketch.strokeWeight(4);
			sketch.line(0, 0, 1200, 0);
			sketch.line(0, 0, 0, 500);
			sketch.line(1200, 0, 1200, 500);

			sketch.stroke(255, 255, 255);

			//goal
			sketch.line(535.1, 0, 664.9, 0);

			//Outer box
			sketch.line(243.2, 0, 243.2, 291.9);
			sketch.line(956.8, 0, 956.8, 291.9);
			sketch.line(243.2, 291.9, 956.8, 291.9);

			//Inner box
			sketch.line(762.2, 0, 762.2, 97.3);
			sketch.line(437.8, 0, 437.8, 97.3);
			sketch.line(437.8, 97.2, 762.2, 97.3);

			//Penalty spot and arc outside box
			sketch.ellipse(600, 194.6, 5, 5);
			sketch.arc(600, 194.6, 324.4, 324.4, 0.65, 2.48);
		}

		/* Used to set where the mouse was initially clicked for dragging operations. */
		function setPressStartPoint() {
			mousePressStartX = sketch.mouseX;
			mousePressStartY = sketch.mouseY;
			mouseCurrentlyPressed = true;
		}

		/* Checks whether the user is dragging the given player to a different part of the screen and moves the player if so. */
		function handleDragMovement(player) {
			moved = false;
			if (mouseCurrentlyPressed === false && sketch.mouseIsPressed) {
				setPressStartPoint();
			}
			if (sketch.mouseIsPressed && player.isMoving() === false && player.shouldMove(mousePressStartX, mousePressStartY)) {
				player.setMovement(true);
				player.clearHistory();
			} 
			if (player.isMoving()) {
				player.move(sketch.mouseX, sketch.mouseY, recording);
				moved = true;
			} 
			if (sketch.mouseIsPressed === false) {
				mouseCurrentlyPressed = false;
				if (player.isMoving()) {
					player.setMovement(false);
				}
			} 
			return moved;
		}
	};


}]);

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope', 'p5',
  function ($scope, $http, $resource, $location, $rootScope, p5) {
  	var sketch = document.getElementById('play-creation');
}]);

