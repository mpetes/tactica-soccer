soccerDraw.factory('play-creation', ['p5', '$resource', '$mdDialog', '$mdBottomSheet', function(p5, $resource, $mdDialog, $mdBottomSheet) {
	return function (sketch) {

		var playId = document.getElementById('saved-play-id').innerHTML;
		if (playId === undefined || playId === "") playId = -1;
		var userEmail = document.getElementById('user-email').innerHTML;
		var userOwned = document.getElementById('user-owned').innerHTML;
		if (userOwned !== "0" && userOwned !== "1") userOwned = -1;

		var FRAME_RATE = 60;

		/* Globals used for representing players. */
		var players = [];
		var numPlayers = 0;
		var ball = new Ball(sketch);
		var ballAdded = false;

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
			var canvas = sketch.createCanvas($(window).width(), $(window).height() - 50);
			canvas.position(0, 50);
			sketch.frameRate(FRAME_RATE);

			function setupEditing() {
				addYourPlayerButton = sketch.createButton('Players');
				addYourPlayerButton.addClass("canvas-button");
				addYourPlayerButton.addClass("md-button");
				addYourPlayerButton.size(100, 40);
				addYourPlayerButton.position(20, 5);
				addYourPlayerButton.mousePressed(addYourPlayer);

				movementButton = sketch.createButton('Movement');
				movementButton.addClass("canvas-button");
				movementButton.addClass("md-button");
				movementButton.size(100, 40);
				movementButton.position(40 + addYourPlayerButton.width, 5);
				movementButton.mousePressed(openBottomSheet);

				displayButton = sketch.createButton('Display');
				displayButton.addClass("canvas-button");
				displayButton.addClass("md-button");
				displayButton.size(100, 40);
				displayButton.position(60 + addYourPlayerButton.width + movementButton.width, 5);
				displayButton.mousePressed(openDisplay);

				saveButton = sketch.createButton('Save');
				saveButton.addClass("canvas-button");
				saveButton.addClass("md-button");
				saveButton.size(100, 40);
				saveButton.position(80 + addYourPlayerButton.width + movementButton.width + displayButton.width, 5);
				saveButton.mousePressed(savePlay);
			}

			function setupSharing() {
				shareButton = sketch.createButton('Share');
				shareButton.addClass("canvas-button");
				shareButton.addClass("md-button");
				shareButton.size(100, 40);
				shareButton.position(100 + addYourPlayerButton.width + movementButton.width + displayButton.width + saveButton.width, 5);
				shareButton.mousePressed(sharePlay);
			}

			if (playId === -1) {
				setupEditing();
			} else if (userOwned === "1") {
				setupEditing();
				setupSharing();
				loadPlay();
			} else if (userOwned === "0") {
				loadPlay();
			}

			playButton = sketch.createButton('Play');
			playButton.addClass("canvas-button");
			playButton.addClass("md-button");
			playButton.size(100, 40);
			playButton.position($(window).width() - 20 - playButton.width, 5);
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
			playbackTimeSelect.position($(window).width() - 40 - playButton.width - playbackTimeSelect.width, 5);

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
						players.push(newPlayer);
					}
					var playBall = JSON.parse(play.ball);
					if (playBall.history !== undefined) {
						ball = new Ball(sketch);
						ball.x = playBall.x;
						ball.y = playBall.y;
						ball.setHistory(playBall.history);
						ballAdded = true;
					}
				}, function errorHandling(err) {
					console.log("Failed to fetch play with id " + playId + ".");
				});
			}

			function openBottomSheet() {
				$mdBottomSheet.show({
					templateUrl: 'components/create/bottom-sheet.html',
					controller: 'BottomSheetController',
					parent: angular.element(document.body),
					locals: {
						allPlayers: players
					}
				})
				.then(function(answer) {
					players = answer;
				}, function () {
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
		}

		function sharePlay() {
			var confirm = $mdDialog.prompt()
		      .title('Share Play')
		      .textContent('Enter email to share with.')
		      .placeholder('jmosmooth@stanford.edu')
		      .ariaLabel('Email')
		      .initialValue('')
		      .ok('Share')
		      .cancel('Cancel');

			$mdDialog.show(confirm).then(function(result) {
		     	var sharePlayRes = $resource("/share-play");
		     	var email = document.getElementById('user-email').innerHTML;
		     	sharePlayRes.save({userEmail: email, emailToShare: result, play: playId}, function(response) {
		     		console.log("play shared!");
			    }, function errorHandling(err) {
			     	alert(err);
			    });
		    }, function() {
		    	console.log("Chose not to share.");
		    });
		}

		function savePlay() {
			var confirm = $mdDialog.prompt()
		      .title('Save Play')
		      .textContent('Enter name of play.')
		      .placeholder('Type...')
		      .ariaLabel('Name')
		      .initialValue('')
		      .ok('Confirm')
		      .cancel('Cancel');

			$mdDialog.show(confirm).then(function(result) {
				var email = document.getElementById('user-email').innerHTML;
				var playerData = [];
				for (var i = 0; i < players.length; i++) {
					var player = players[i];
					var newPlayer = {id: player.id, x: player.x, y: player.y, attackTeam: player.attackTeam, history: player.history, currentNumber: player.currentNumber, startingNumber: player.startingNumber, color: player.color, shape: player.shape};
					playerData.push(newPlayer);
				}
				var ballData = {x: ball.x, y: ball.y, history: ball.history};
				if (playId === -1) {
					var newPlayRes = $resource('/create-new-play');
					newPlayRes.save({userEmail: email, userPlayers: playerData, userBall: ballData, playName: result}, function(response) {
						playId = response.id;
				  		console.log("New play created with id " + playId + ".");
				  	}, function errorHandling(err) {
				        console.error("Could not create new play.");
				    });
				} else {
					var updatePlayRes = $resource('/update-play');
					updatePlayRes.save({userEmail: email, id: playId, userPlayers: playerData, userBall: ballData, playName: result}, function(response) {
				  		console.log("Play with id " + playId + " saved.");
				  	}, function errorHandling(err) {
				        console.error("Could not save play.");
				    });
				}
		    }, function() {
		    	console.log("Chose not to save.");
		    });
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
				player.endTime = parseFloat(playbackTimeSelect.value());
				var history = player.getHistory();
				var newPosition = {};
				if (history.length === 0) {
					newPosition = player.getPosition();
				} else {
					if (advanced) {
						var index = Math.round((currFrame/framesToShow) * history.length);
						if (index >= history.length) index = history.length - 1;
						var currPosition = history[index];
						newPosition.x = currPosition.x * $(window).width();
						newPosition.y = currPosition.y * $(window).width();
						if (trail) drawTrail(history, index, true, player);
					} else {
						var currentTime = currFrame / 60.0;

						var start = history[0];
						var newStart = {};
						newStart.x = start.x * $(window).width();
						newStart.y = start.y * $(window).width();

						var end = history[history.length - 1];
						var newEnd = {};
						newEnd.x = end.x * $(window).width();
						newEnd.y = end.y * $(window).width();

						if (currentTime < player.startTime) {
							newPosition = newStart;
						} else if (currentTime > player.endTime) {
							newPosition = newEnd;
						} else {
							var deltaX = newEnd.x - newStart.x;
							var deltaY = newEnd.y - newStart.y;

							var moveFrames = (player.endTime - player.startTime) * FRAME_RATE;
							var shiftedFrame = currFrame - (player.startTime * FRAME_RATE);

							newPosition.x = newStart.x + Math.round((shiftedFrame/moveFrames) * deltaX);
							newPosition.y = newStart.y + Math.round((shiftedFrame/moveFrames) * deltaY);
						}
						if (trail) {
							drawLineBetween(newStart, newPosition, player);
						}
					}
				}
				player.move(newPosition.x, newPosition.y, false);
			}
			
			if (ballAdded) {
				var history = ball.getHistory();
				var newPosition = {};
				var start = history[0];
				var newStart = {};
				newStart.x = start.x * $(window).width();
				newStart.y = start.y * $(window).width();
				var end = history[history.length - 1];
				var newEnd = {};
				newEnd.x = end.x * $(window).width();
				newEnd.y = end.y * $(window).width();
				var deltaX = newEnd.x - newStart.x;
				var deltaY = newEnd.y - newStart.y;
				newPosition.x = newStart.x + Math.round((currFrame/framesToShow) * deltaX);
				newPosition.y = newStart.y + Math.round((currFrame/framesToShow) * deltaY);
				if (trail) {
					drawLineBetween(newStart, newPosition, ball);
				}
				ball.move(newPosition.x, newPosition.y, false);
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
		function drawTrail(history, lengthToShow, advanced, player) {
			sketch.stroke(player.color.red, player.color.green, player.color.blue);
			sketch.fill(player.color.red, player.color.green, player.color.blue);
			sketch.strokeWeight(3);
			if (advanced) {
				for (var i = 0; i <= lengthToShow; i++) {
					if (i !== 0 && i < history.length) {
						var width = $(window).width();
						var height = $(window).width();
						sketch.line(history[i-1].x * width, history[i-1].y * height, history[i].x * width, history[i].y * height);
					}
				}
			} else {
				if (history.length >= 2) {
					var start = history[0];
					var end = history[lengthToShow];
					var width = $(window).width();
					var height = $(window).width();
					sketch.line(start.x * width, start.y * height, end.x * width, end.y * height);
				}
			}
		}

		/* Draws trails for all players on the screen. */
		function drawTrails() {
			for (var i = 0; i < players.length; i++) {
				var history = players[i].getHistory();
				drawTrail(history, history.length - 1, advanced, players[i]);
			}
			if (ballAdded) {
				var history = ball.getHistory();
				if (history.length >= 2) {
					var start = history[0];
					var end = history[history.length - 1];
					var width = $(window).width();
					var height = $(window).width();
					sketch.stroke(ball.color.red, ball.color.green, ball.color.blue);
					sketch.fill(ball.color.red, ball.color.green, ball.color.blue);
					sketch.line(start.x * width, start.y * height, end.x * width, end.y * height);
				}
			}
		}

		/* Differs from drawTrail in that it doesn't have a history but rather two points to draw a line between. */
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

				//Only one player should be allowed to be dragged at a time
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

