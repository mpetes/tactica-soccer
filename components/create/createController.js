soccerDraw.factory('play-creation', ['p5', '$resource', '$mdDialog', '$mdBottomSheet', function(p5, $resource, $mdDialog, $mdBottomSheet) {
	return function (sketch) {

		/* Parse route parameters. */
		var playId = document.getElementById('saved-play-id').innerHTML;
		if (playId === "undefined" || playId === "") playId = -1;
		var userEmail = document.getElementById('user-email').innerHTML;
		var userOwned = document.getElementById('user-owned').innerHTML;
		if (userOwned !== "0" && userOwned !== "1") userOwned = -1;

		/* Constants. */
		var FRAME_RATE = 60;
		var CANVAS_Y_OFFSET = 60;
		var BUTTON_Y_OFFSET = 12;

		/* Globals used for representing players. */
		var players = [];
		var numPlayers = 0;
		var ball = new Ball(sketch);
		var ballAdded = false;

		/* Globals used for movement, recording, and playback. */
		var recording = false;
		var playing = false;
		var currFrame = -1;
		var framesToShow = 3 * FRAME_RATE;
		var trail = true;
		var advanced = false;

		/* Globals used for player tracking. */
		var mousePressStartX = -100;
		var mousePressStartY = -100;
		var mouseCurrentlyPressed = false;

		/* Globals used to check for changing window size. */
		var currWindowSize = 0;
		var canvas;

		/* Defines where a player is in his movement during a play. */
		var SECTION_TYPES = {
			BEFORE_START: 0,
			IN_MIDDLE: 1,
			AFTER_END: 2
		};

		/* Shift + R = recording, Shift + T = trail, Shift + E = exact/advanced, Shift + B = ball. */
		document.body.addEventListener('keydown', function(e) {
			if (e.shiftKey) {
				if (e.keyCode === 82) {
			   		recording = !recording;
				}
				if (e.keyCode === 84) {
					trail = !trail;
				} 
				if (e.keyCode === 69) {
					advanced = !advanced;
				}
				if (e.keyCode === 66) {
					ballAdded = !ballAdded;
				}
			}
		});

		/* Called once at loading of page. Sets up the canvas and necessary buttons. */
		sketch.setup = function () {
			currWindowSize = $(window).width();
			canvas = sketch.createCanvas($(window).width(), $(window).height() - CANVAS_Y_OFFSET);
			canvas.position(0, CANVAS_Y_OFFSET);
			sketch.frameRate(FRAME_RATE);

			/* Add the editor tools. */
			function setupEditing() {
				addYourPlayerButton = sketch.createButton('Players');
				addYourPlayerButton.addClass("canvas-button");
				addYourPlayerButton.addClass("md-button");
				addYourPlayerButton.size(100, 40);
				addYourPlayerButton.position(20, BUTTON_Y_OFFSET);
				addYourPlayerButton.mousePressed(addYourPlayer);

				movementButton = sketch.createButton('Movement');
				movementButton.addClass("canvas-button");
				movementButton.addClass("md-button");
				movementButton.size(100, 40);
				movementButton.position(40 + addYourPlayerButton.width, BUTTON_Y_OFFSET);
				movementButton.mousePressed(openBottomSheet);

				displayButton = sketch.createButton('Display');
				displayButton.addClass("canvas-button");
				displayButton.addClass("md-button");
				displayButton.size(100, 40);
				displayButton.position(60 + addYourPlayerButton.width + movementButton.width, BUTTON_Y_OFFSET);
				displayButton.mousePressed(openDisplay);

				saveButton = sketch.createButton('Save Play');
				saveButton.addClass("canvas-button");
				saveButton.addClass("md-button");
				saveButton.size(100, 40);
				saveButton.position(80 + addYourPlayerButton.width + movementButton.width + displayButton.width, BUTTON_Y_OFFSET);
				saveButton.mousePressed(savePlay);
			}

			/* Add owner sharing tools. */
			function setupSharing() {
				shareButton = sketch.createButton('Share Play');
				shareButton.addClass("canvas-button");
				shareButton.addClass("md-button");
				shareButton.size(100, 40);
				shareButton.position(100 + addYourPlayerButton.width + movementButton.width + displayButton.width + saveButton.width, BUTTON_Y_OFFSET);
				shareButton.mousePressed(sharePlay);
			}

			/* Determine sharing, editing abilities and whether the play needs to be fetched from DB. */
			if (playId === -1) {
				setupEditing();
			} else {
				loadPlay();
			} 

			/* Add playback tools. */
			function setupPlaying() {
				playButton = sketch.createButton('Play');
				playButton.addClass("canvas-button");
				playButton.addClass("md-button");
				playButton.size(100, 40);
				playButton.position($(window).width() - 20 - playButton.width, BUTTON_Y_OFFSET);
				playButton.mousePressed(play);

				playbackTimeSelect = sketch.createInput(3.0);
				playbackTimeSelect.elt.type = "number";
				playbackTimeSelect.elt.min = 0.1;
				playbackTimeSelect.elt.max = 25.0;
				playbackTimeSelect.elt.step = 0.1;
				playbackTimeSelect.addClass('playback-time');
				playbackTimeSelect.changed(setPlaybackTime);
				playbackTimeSelect.size(45, 30);
				playbackTimeSelect.position($(window).width() - 40 - playButton.width - playbackTimeSelect.width, BUTTON_Y_OFFSET + 3);

				playbackTimeLabel = sketch.createP('PLAYBACK TIME: ');
				playbackTimeLabel.addClass('playback-time-label');
				playbackTimeLabel.size(100, 40);
				playbackTimeLabel.position($(window).width() - 44 - playButton.width - playbackTimeSelect.width - playbackTimeLabel.width, BUTTON_Y_OFFSET + 1.5);
			}

			setupPlaying();

			/* Called if we determine that we are loading a previously created play. */
			function loadPlay() {
				var playRes = $resource("/load-play");
				playRes.get({email: userEmail, id: playId, owned: userOwned}, function(response) {
					var play = response;
					var oldPlayers = JSON.parse(play.players);
					for (var i = 0; i < oldPlayers.length; i++) {
						var newPlayer = new Player(sketch, oldPlayers[i].attackTeam, oldPlayers[i].id, oldPlayers[i].currentNumber, oldPlayers[i].color, oldPlayers[i].shape);
						newPlayer.setHistory(oldPlayers[i].history);
						newPlayer.x = oldPlayers[i].x;
						newPlayer.y = oldPlayers[i].y;
						newPlayer.startingNumber = oldPlayers[i].startingNumber;
						players.push(newPlayer);
					}
					var playBall = JSON.parse(play.ball);
					if (playBall.history.length !== 0) {
						ball = new Ball(sketch);
						ball.x = playBall.x;
						ball.y = playBall.y;
						ball.setHistory(playBall.history);
						ballAdded = true;
					}
					if (userOwned === "1") {
						setupEditing();
						setupSharing();
					} 
				}, function errorHandling(err) {
					console.log("Failed to fetch play with id " + playId + ".");
				});
			}

			// CALLBACK FUNCTIONS FOR CREATIVE TOOLS
			function openBottomSheet() {
				$mdBottomSheet.show({
					templateUrl: 'components/create/bottom-sheet.html',
					controller: 'BottomSheetController',
					parent: angular.element(document.body),
					locals: {
						allPlayers: players,
						playTime: parseFloat(playbackTimeSelect.value()),
						gameBall: ball
					}
				})
				.then(function(answer) {
					players = answer.players;
					ball = answer.ball;
				}, function () {
					console.log("Chose not to save movement settings.");
				});
			}

			function openDisplay() {
				$mdDialog.show({
					templateUrl: 'components/create/display-settings.html',
					controller: 'DisplaySettingsController',
					parent: angular.element(document.body),
					locals: {
						isRecording: recording,
						isAdvanced: advanced,
						isTrail: trail,
						isBall: ballAdded
					}
				})
				.then(function(answer) {
					var settings = JSON.parse(answer);
					recording = settings.recording;
					advanced = settings.advanced;
					trail = settings.trail;
					ballAdded = settings.ball;
				}, function() {
					console.error("Could not parse display settings.");
				});
			}

			function addYourPlayer() {
				$mdDialog.show({
					templateUrl: 'components/create/player-picker.html',
					controller: 'PlayerPickerController',
					parent: angular.element(document.body),
					locals: {
						allPlayers: players
					}
			    })
			    .then(function(answer) {
			    	var allPlayers = JSON.parse(answer);
			    	for (var i = 0; i < allPlayers.length; i++) {
			    		var currPlayer = allPlayers[i];
			    		if (currPlayer.new === true) {
			    			var player = new Player(sketch, currPlayer.team, numPlayers, currPlayer.currentNumber, currPlayer.color, currPlayer.shape);
			    			numPlayers++;
							players.push(player);
			    		} else {

			    			for (var j = 0; j < players.length; j++) {
			    				if (players[j].startingNumber === currPlayer.startingNumber) {
			    					players[j].currentNumber = currPlayer.currentNumber;
			    					players[j].color = currPlayer.color;
			    					players[j].shape = currPlayer.shape;
			    				}
			    			}
			    		}

			    	}
			    }, function() {
			    	console.log("Chose not to add players.");
			    });
			}

			function setPlaybackType() {
				playbackType = playbackTypeSelect.value();
			}

			function setPlaybackTime() {
				framesToShow = parseFloat(playbackTimeSelect.value()) * FRAME_RATE;
			}

			function play() {
				playing = true;
				currFrame = 0;
			}

			function sharePlay() {
				$mdDialog.show({
					templateUrl: 'components/create/share-play.html',
					controller: 'SharePlayController',
					parent: angular.element(document.body)
			    })
			    .then(function(result) {
			    	var sharePlayRes = $resource("/share-play");
			     	var email = document.getElementById('user-email').innerHTML;
			     	var shareInfo = JSON.parse(result);
			     	sharePlayRes.save({userEmail: email, emailToShare: shareInfo.email, play: playId, accessLevel: shareInfo.accessLevel}, function(response) {
			     		console.log("Play shared!");
				    }, function errorHandling(err) {
				     	alert(err);
				    });
			    }, function() {
			    	console.log("Chose not to share.");
			    });
			}

			function savePlay() {
				$mdDialog.show({
					templateUrl: 'components/create/save-play.html',
					controller: 'SavePlayController',
					parent: angular.element(document.body)
			    })
			    .then(function(result) {
			    	var email = document.getElementById('user-email').innerHTML;
			    	var name = JSON.parse(result).name;
					var playerData = [];
					for (var i = 0; i < players.length; i++) {
						var player = players[i];
						var newPlayer = {id: player.id, x: player.x, y: player.y, attackTeam: player.attackTeam, history: player.history, currentNumber: player.currentNumber, startingNumber: player.startingNumber, color: player.color, shape: player.shape};
						playerData.push(newPlayer);
					}
					var ballData = {x: ball.x, y: ball.y, history: ball.history};
					if (playId === -1) {
						var newPlayRes = $resource('/create-new-play');
						newPlayRes.save({userEmail: email, userPlayers: playerData, userBall: ballData, playName: name}, function(response) {
							playId = response.id;
					  		console.log("New play created with id " + playId + ".");
					  	}, function errorHandling(err) {
					        console.error("Could not create new play.");
					    });
					} else {
						var updatePlayRes = $resource('/update-play');
						updatePlayRes.save({userEmail: email, id: playId, userPlayers: playerData, userBall: ballData, playName: name}, function(response) {
					  		console.log("Play with id " + playId + " saved.");
					  	}, function errorHandling(err) {
					        console.error("Could not save play.");
					    });
			    	}
			    }, function() {
			    	console.log("Chose not to save.");
			    });
			}
			// END CALLBACK FUNCTIONS FOR CREATIVE TOOLS
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
			var playTime = parseFloat(playbackTimeSelect.value());
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				animateObject(player, playTime);
			}

			if (ballAdded) animateObject(ball, playTime);

			currFrame++;
			if (currFrame > framesToShow) {
				playing = false;
				currFrame = -1;
			}
		}

		/* Given an object (player or ball), animates it according to the current time. */
		function animateObject(player, playTime) {
			player.determineStartTimes(playTime);

			var history = player.getHistory();
			var newPosition = {};

			/* No history? Stay in place. */
			if (history.length === 0) {
				newPosition = player.getPosition();

			/* If using advanced mode, should exactly follow path recorded. */
			} else if (advanced) {
				var allHistory = player.combineHistory();
				var index = Math.round((currFrame/framesToShow) * allHistory.length);
				if (index >= allHistory.length) index = allHistory.length - 1;
				var currPosition = allHistory[index];
				newPosition.x = currPosition.x * $(window).width();
				newPosition.y = currPosition.y * $(window).width();
				if (trail) showHistory(allHistory, index, true, player);

			/* Otherwise, follow direct line from start to end for each section. */
			} else {

				// Determine which 'section' of the player's history we are in. Draw all prior sections if client wants trails.
				var currentTime = currFrame / 60.0;
				var sectionType = SECTION_TYPES.BEFORE_START;
				var sectionNumber = 0;
				for (var j = 0; j < history.length; j++) {
					var section = history[j];
					var startTime = section.startPercentage * playTime;
					var endTime = section.endPercentage * playTime;
					if (currentTime >= startTime && currentTime < endTime) {
						sectionType = SECTION_TYPES.IN_MIDDLE;
						sectionNumber = j;
						break;
					} else if (currentTime < startTime) {
						sectionNumber = j;
						break;
					} else {
						if (trail) showHistory(section.movement, section.movement.length - 1, false, player);
						if (j === history.length - 1) sectionType = SECTION_TYPES.AFTER_END;
					}
				}

				// If we are before the start of a section, position should be at the start of that section
				if (sectionType === SECTION_TYPES.BEFORE_START) {
					newPosition.x = history[sectionNumber].movement[0].x * $(window).width();
					newPosition.y = history[sectionNumber].movement[0].y * $(window).width();

				// If we are in the middle of a section, position should be at a scaled point along the direct line between
				// the start and end of the section.
				} else if (sectionType === SECTION_TYPES.IN_MIDDLE) {
					var section = history[sectionNumber];
					var startTime = section.startPercentage * playTime;
					var endTime = section.endPercentage * playTime;

					var start = section.movement[0];
					var newStart = {};
					newStart.x = start.x * $(window).width();
					newStart.y = start.y * $(window).width();

					var end = section.movement[section.movement.length - 1];
					var newEnd = {};
					newEnd.x = end.x * $(window).width();
					newEnd.y = end.y * $(window).width();

					var deltaX = newEnd.x - newStart.x;
					var deltaY = newEnd.y - newStart.y;

					var moveFrames;	
					if (endTime <= playTime) {
						moveFrames = (endTime - startTime) * FRAME_RATE;
					} else {
						moveFrames = (playTime - startTime) * FRAME_RATE;
					}
					var shiftedFrame = currFrame - (startTime * FRAME_RATE);

					newPosition.x = newStart.x + Math.round((shiftedFrame/moveFrames) * deltaX);
					newPosition.y = newStart.y + Math.round((shiftedFrame/moveFrames) * deltaY);
					if (trail) drawLineBetween(newStart, newPosition, player);

				// If we are at the end of a section, position should be that section's end.
				} else {
					var section = history[history.length - 1];
					newPosition.x = section.movement[section.movement.length - 1].x * $(window).width();
					newPosition.y = section.movement[section.movement.length - 1].y * $(window).width();
				}
			}

			player.move(newPosition.x, newPosition.y, false);
		}

		/* Draws a trail for given player history array from the start to the point in the history
		array at lengthToShow, using the advanced flag to determine how the trail should look
		and the isUserTeam flag to determine the color of the trail. */
		function showHistory(history, lengthToShow, advanced, player) {
			sketch.stroke(player.color.red, player.color.green, player.color.blue);
			sketch.fill(player.color.red, player.color.green, player.color.blue);
			sketch.strokeWeight(3);
			var currWidth = $(window).width();
			if (advanced) {
				for (var i = 0; i <= lengthToShow; i++) {
					if (i !== 0 && i < history.length) sketch.line(history[i-1].x * currWidth, history[i-1].y * currWidth, history[i].x * currWidth, history[i].y * currWidth);
				}
			} else {
				if (history.length >= 2) {
					var start = history[0];
					var end = history[lengthToShow];
					sketch.line(start.x * currWidth, start.y * currWidth, end.x * currWidth, end.y * currWidth);
				}
			}
		}

		/* Draws trails for all players on the screen. */
		function drawTrails() {
			for (var i = 0; i < players.length; i++) {
				var history = players[i].getHistory();
				for (var j = 0; j < history.length; j++) {
					var section = history[j];
					showHistory(section.movement, section.movement.length - 1, advanced, players[i]);
				}
			}
			if (ballAdded) {
				var history = ball.getHistory();
				if (history.length > 0) {
					for (var j = 0; j < history.length; j++) {
						var section = history[j];
						showHistory(section.movement, section.movement.length - 1, advanced, ball);
					}
				}
			}
		}

		/* Differs from showHistory in that it doesn't have a history but rather two points to draw a line between. */
		function drawLineBetween(start, end, player) {
			sketch.stroke(player.color.red, player.color.green, player.color.blue);
			sketch.fill(player.color.red, player.color.green, player.color.blue);
			sketch.strokeWeight(3);
			sketch.line(start.x, start.y, end.x, end.y);
		}

		/* Draws all players on the screen in a non-playing phase. */
		function drawPlayers() {
			var moved = false;
			for (var x = 0; x < players.length; x++) {
				var player = players[x];

				//Only one object should be allowed to be dragged at a time
				if (moved === false) moved = handleDragMovement(player, recording);
				player.display();
			}

			if (ballAdded) {
				if (moved === false) moved = handleDragMovement(ball, recording);
				ball.display();
			}
		}

		/* Sets up the soccer field on the screen. */
		function drawInitialField() {
			var currFrameWidth = $(window).width();
			if (currWindowSize !== currFrameWidth) {
				canvas.size(currFrameWidth, $(window).height() - CANVAS_Y_OFFSET);
				canvas.position(0, CANVAS_Y_OFFSET);
				currWindowSize = currFrameWidth;
			}

			sketch.background("green");
			sketch.stroke(255, 255, 255);
			sketch.noFill();

			//Corner flags
			sketch.arc(0, 0, 30, 30, 0, 1.57);
			sketch.arc(currFrameWidth, 0, 30, 30, 1.57, 3.14);

			//goal
			sketch.line(currFrameWidth/2 - 0.0534*currFrameWidth, 0, currFrameWidth/2 + 0.0534*currFrameWidth, 0);

			//Outer box
			sketch.line(currFrameWidth/2 - 0.2943*currFrameWidth, 0, currFrameWidth/2 - 0.2943*currFrameWidth, 0.2409*currFrameWidth);
			sketch.line(currFrameWidth/2 + 0.2943*currFrameWidth, 0, currFrameWidth/2 + 0.2943*currFrameWidth, 0.2409*currFrameWidth);
			sketch.line(currFrameWidth/2 - 0.2943*currFrameWidth, 0.2409*currFrameWidth, currFrameWidth/2 + 0.2943*currFrameWidth, 0.2409*currFrameWidth);

			//Inner box
			sketch.line(currFrameWidth/2 + 0.1337*currFrameWidth, 0, currFrameWidth/2 + 0.1337*currFrameWidth, 0.0803*currFrameWidth);
			sketch.line(currFrameWidth/2 - 0.1337*currFrameWidth, 0, currFrameWidth/2 - 0.1337*currFrameWidth, 0.0803*currFrameWidth);
			sketch.line(currFrameWidth/2 - 0.1337*currFrameWidth, 0.0803*currFrameWidth, currFrameWidth/2 + 0.1337*currFrameWidth, 0.0803*currFrameWidth);

			//Penalty spot and arc outside box
			sketch.ellipse(currFrameWidth/2, 0.1606*currFrameWidth, 5, 5);
			sketch.arc(currFrameWidth/2, 0.1606*currFrameWidth, 0.2671*currFrameWidth, 0.2671*currFrameWidth, 0.65, 2.48);

			sketch.stroke(0, 0, 0);

			//sidelines
			sketch.strokeWeight(4);
			sketch.line(0, 0, currFrameWidth/2 - 0.0534*currFrameWidth, 0);
			sketch.line(currFrameWidth/2 + 0.0534*currFrameWidth, 0, currFrameWidth, 0);
			sketch.line(0, 0, 0, $(window).height());
			sketch.line(currFrameWidth, 0, currFrameWidth, $(window).height());
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
				player.setMovement(true, recording);
				if (!recording) player.clearHistory();
			} 
			if (player.isMoving()) {
				player.move(sketch.mouseX, sketch.mouseY, recording);
				moved = true;
			} 
			if (sketch.mouseIsPressed === false) {
				mouseCurrentlyPressed = false;
				if (player.isMoving()) {
					player.setMovement(false, recording);
				}
			} 
			return moved;
		}
	};


}]);

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope', '$routeParams',
  function ($scope, $http, $resource, $location, $rootScope, $routeParams) {

  	$scope.savedPlay = {};
  	$scope.savedPlay.id = $routeParams.playId;
  	$scope.savedPlay.owned = parseInt($routeParams.owned);
  	if ($scope.savedPlay.owned !== 1) {
  		$scope.savedPlay.owned = 0;
  	}
  	document.getElementById('saved-play-id').innerHTML = $scope.savedPlay.id;
  	document.getElementById('user-email').innerHTML = $scope.main.email;
  	document.getElementById('user-owned').innerHTML = $scope.savedPlay.owned;
}]);

