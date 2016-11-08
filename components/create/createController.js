soccerDraw.factory('play-creation', ['p5', '$resource', function(p5, $resource) {
	return function (sketch) {

		var FRAME_RATE = 60;

		/* Globals used for representing players. */
		var players = [];
		var numPlayers = 0;
		var ball = {};
		var playId = -1;

		/* Globals used for movement, recording, and playback. */
		var recording = false;
		var playing = false;
		var currFrame = -1;
		var framesToShow = 1 * FRAME_RATE;
		var trail = true;
		var advanced = false;

		/* Globals used for player tracking. */
		var mousePressStartX = -100;
		var mousePressStartY = -100;
		var mouseCurrentlyPressed = false;

		/* Called once at loading of page. Sets up the canvas and necessary buttons. */
		sketch.setup = function () {
			canvas = sketch.createCanvas($(window).width(), $(window).height() - 50);
			canvas.position(0, 50);
			sketch.frameRate(FRAME_RATE);

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
			recordCheckbox.width = 70;
			recordCheckbox.changed(setRecord);

			trailCheckbox = sketch.createCheckbox('Trail', true);
			trailCheckbox.position(60 + addYourPlayerButton.width + addOpposingPlayerButton.width + clearAllPlayersButton.width + clearHistoryButton.width + recordCheckbox.width, 10);
			trailCheckbox.width = 50;
			trailCheckbox.changed(setTrail);

			advancedCheckbox = sketch.createCheckbox('Advanced', false);
			advancedCheckbox.position(70 + addYourPlayerButton.width + addOpposingPlayerButton.width + clearAllPlayersButton.width + clearHistoryButton.width + recordCheckbox.width + trailCheckbox.width, 10);
			advancedCheckbox.width = 100;
			advancedCheckbox.changed(setAdvanced);

			saveButton = sketch.createButton('Save');
			saveButton.position(80 + addYourPlayerButton.width + addOpposingPlayerButton.width + clearAllPlayersButton.width + clearHistoryButton.width + recordCheckbox.width + trailCheckbox.width + advancedCheckbox.width, 10);
			saveButton.mousePressed(savePlay);

			playButton = sketch.createButton('Play');
			playButton.position($(window).width() - 10 - playButton.width, 10);
			playButton.mousePressed(play);

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
			playbackTimeSelect.width = 45;
			playbackTimeSelect.position($(window).width() - 30 - playButton.width - playbackTimeSelect.width, 10);

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

			function setRecord() {
				if (this.checked()) {
					recording = true;
				} else {
					recording = false;
				}
			}

			function setTrail() {
				if (this.checked()) {
					trail = true;
				} else {
					trail = false;
				}
			}

			function setAdvanced() {
				if (this.checked()) {
					advanced = true;
				} else {
					advanced = false;
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
				framesToShow = parseFloat(playbackTimeSelect.value()) * FRAME_RATE;
			}

			function play() {
				playing = true;
				currFrame = 0;
			}
		}

		function savePlay() {
			var email = document.getElementById('user-email').innerHTML;
			var playerData = [];
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				var newPlayer = {id: player.id, x: player.x, y: player.y, userTeam: player.userTeam, history: player.history};
				playerData.push(newPlayer);
			}
			if (playId === -1) {
				var newPlayRes = $resource('/create-new-play');
				newPlayRes.save({userEmail: email, userPlayers: playerData, userBall: ball}, function(response) {
					playId = response.id;
			  		console.log("New play created with id " + playId + ".");
			  	}, function errorHandling(err) {
			        console.error("Could not create new play.");
			    });
			} else {
				var updatePlayRes = $resource('/update-play');
				updatePlayRes.save({userEmail: email, id: playId, userPlayers: playerData, userBall: ball}, function(response) {
			  		console.log("Play with id " + playId + " saved.");
			  	}, function errorHandling(err) {
			        console.error("Could not save play.");
			    });
			}
		}

		/* Called on every frame. Handles drawing on screen. */
		sketch.draw = function () {
			drawInitialField();
			if (playing) {
				animatePlay();
			} else {
				drawPlayers();
				if (trail) drawTrails();
			}
		}

		/* If the client has started the play, this will update the canvas with the new location for
		where each player should be at the current frame. */
		function animatePlay() {
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				var history = player.getHistory();
				var currPosition = {};
				if (history.length === 0) {
					currPosition = player.getPosition();
				} else {
					if (advanced) {
						var index = Math.round((currFrame/framesToShow) * history.length);
						if (index >= history.length) index = history.length - 1;
						currPosition = history[index];
						if (trail) drawTrail(history, index, true, player.isUserTeam());
					} else {
						var start = history[0];
						var end = history[history.length - 1];
						var deltaX = end.x - start.x;
						var deltaY = end.y - start.y;
						currPosition.x = start.x + Math.round((currFrame/framesToShow) * deltaX);
						currPosition.y = start.y + Math.round((currFrame/framesToShow) * deltaY);
						if (trail) {
							drawLineBetween(start, currPosition, player.isUserTeam());
						}
					}
				}
				player.move(currPosition.x, currPosition.y, false);
			}
			currFrame++;
			if (currFrame > framesToShow) {
				playing = false;
				currFrame = -1;
			}
		}

		/* Draws a trail for given player history from the start to the point in the history
		array at lengthToShow, using the advanced flag to determine how the trail should look
		and the isUserTeam flag to determine the color of the trail. */
		function drawTrail(history, lengthToShow, advanced, isUserTeam) {
			if (advanced) {
				for (var i = 0; i <= lengthToShow; i++) {
					if (i !== 0 && i < history.length) {
						if (isUserTeam) {
							sketch.stroke(232, 222, 42);
							sketch.fill(232, 222, 42);
						} else {
							sketch.stroke(17,42,38);
							sketch.fill(17,42,38);
						}
						sketch.strokeWeight(3);
						sketch.line(history[i-1].x, history[i-1].y, history[i].x, history[i].y);
					}
				}
			} else {
				if (history.length >= 2) {
					var start = history[0];
					var end = history[lengthToShow];
					if (isUserTeam) {
						sketch.stroke(232, 222, 42);
						sketch.fill(232, 222, 42);
					} else {
						sketch.stroke(17,42,38);
						sketch.fill(17,42,38);
					}
					sketch.strokeWeight(3);
					sketch.line(start.x, start.y, end.x, end.y);
				}
			}
		}

		/* Draws trails for all players on the screen. */
		function drawTrails() {
			for (var i = 0; i < players.length; i++) {
				var history = players[i].getHistory();
				drawTrail(history, history.length - 1, advanced, players[i].isUserTeam());
			}
		}

		/* Differs from drawTrail in that it doesn't have a history but rather two points to draw a line between. */
		function drawLineBetween(start, end, isUserTeam) {
			if (isUserTeam) {
				sketch.stroke(232, 222, 42);
				sketch.fill(232, 222, 42);
			} else {
				sketch.stroke(17,42,38);
				sketch.fill(17,42,38);
			}
			sketch.strokeWeight(3);
			sketch.line(start.x, start.y, end.x, end.y);
		}

		/* Draws all players on the screen in a non-playing phase. */
		function drawPlayers() {
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
			sketch.arc($(window).width(), 0, 30, 30, 1.57, 3.14);

			//sidelines
			sketch.strokeWeight(4);
			sketch.line(0, 0, $(window).width(), 0);
			sketch.line(0, 0, 0, $(window).height());
			sketch.line($(window).width(), 0, $(window).width(), $(window).height());

			sketch.stroke(255, 255, 255);

			//goal
			sketch.line($(window).width()/2 - 0.0534*$(window).width(), 0, $(window).width()/2 + 0.0534*$(window).width(), 0);

			//Outer box
			sketch.line($(window).width()/2 - 0.2943*$(window).width(), 0, $(window).width()/2 - 0.2943*$(window).width(), 0.2409*$(window).width());
			sketch.line($(window).width()/2 + 0.2943*$(window).width(), 0, $(window).width()/2 + 0.2943*$(window).width(), 0.2409*$(window).width());
			sketch.line($(window).width()/2 - 0.2943*$(window).width(), 0.2409*$(window).width(), $(window).width()/2 + 0.2943*$(window).width(), 0.2409*$(window).width());

			//Inner box
			sketch.line($(window).width()/2 + 0.1337*$(window).width(), 0, $(window).width()/2 + 0.1337*$(window).width(), 0.0803*$(window).width());
			sketch.line($(window).width()/2 - 0.1337*$(window).width(), 0, $(window).width()/2 - 0.1337*$(window).width(), 0.0803*$(window).width());
			sketch.line($(window).width()/2 - 0.1337*$(window).width(), 0.0803*$(window).width(), $(window).width()/2 + 0.1337*$(window).width(), 0.0803*$(window).width());

			//Penalty spot and arc outside box
			sketch.ellipse($(window).width()/2, 0.1606*$(window).width(), 5, 5);
			sketch.arc($(window).width()/2, 0.1606*$(window).width(), 0.2671*$(window).width(), 0.2671*$(window).width(), 0.65, 2.48);
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

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {
  	document.getElementById('user-email').innerHTML = $scope.main.email;
}]);

