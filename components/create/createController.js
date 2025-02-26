soccerDraw.factory('play-creation', ['p5', '$resource', '$mdDialog', '$mdBottomSheet', function(p5, $resource, $mdDialog, $mdBottomSheet) {
	return function (sketch) {

		/* Parse route parameters. */
		var playId = document.getElementById('saved-play-id').innerHTML;
		if (playId === "undefined" || playId === "") playId = -1;
		var userEmail = document.getElementById('user-email').innerHTML;
		var userOwned = document.getElementById('user-owned').innerHTML;
		if (userOwned !== "0" && userOwned !== "1") userOwned = -1;
		var playName = "";

		/* Canvas frame rate slows down when in full field mode due to p5js bugs. This variables will track the number of actual frames
		displayed in this mode so that we can scale our display frame value to account for this bug. */
		var actualFrames = 0;

		/* Constants. */
		var FRAME_RATE = 60;
		var CANVAS_Y_OFFSET = 60;
		var CANVAS_OFFSET_FROM_TOP = 40 + CANVAS_Y_OFFSET;
		var BUTTON_Y_OFFSET = 12;
		var CURRENT_TIME_DISPLAY_DELAY = 500
		var GOOGLE_BUTTON_WIDTH = 36;

		/* Globals used for field display. */
		var whiteBackground = false;
		var fullField = false;
		var FIELD_DIMENIONS_RATIO = 115 / 75;
		var atHistoryStart = false;
		var addYourPlayerButton, movementButton, displayButton, saveButton, recordButton;

		/* Globals used for representing players. */
		var players = [];
		var numPlayers = 0;
		var ball = new Ball(sketch);
		var ballAdded = false;

		/* Globals used for movement, recording, and playback. */
		var recording = false;
		var playing = false;
		var paused = false;
		var currFrame = -1;
		var framesToShow = 3 * FRAME_RATE;
		var trail = true;
		var advanced = false;
		var playbackTimeSelect, currentTimeLabel;

		/* Globals used for player tracking. */
		var mousePressStartX = -100;
		var mousePressStartY = -100;
		var mouseCurrentlyPressed = false;

		/* Globals used to check for changing window size. */
		var currWindowSize = {width: 0, height: 0};
		var canvas;
		var trashCan = null;

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
			   		record();
				} else if (e.keyCode === 84) {
					trail = !trail;
				} else if (e.keyCode === 69) {
					advanced = !advanced;
				} else if (e.keyCode === 66) {
					ballAdded = !ballAdded;
				} else if (e.keyCode === 87) {
					whiteBackground = !whiteBackground;
				} else if (e.keyCode === 70) {
					fullField = !fullField;
				} else if (e.keyCode === 80) {
					if (trail) {
						atHistoryStart = !atHistoryStart;
					} else {
						atHistoryStart = false;
					}
				}
			}
		});

		/* Called once at loading of page. Sets up the canvas and necessary buttons. */
		sketch.setup = function () {
			currWindowSize.width = $(window).width();
			currWindowSize.height = $(window).width() - CANVAS_OFFSET_FROM_TOP;
			canvas = sketch.createCanvas($(window).width(), $(window).height() - CANVAS_Y_OFFSET);
			canvas.position(0, CANVAS_Y_OFFSET);
			sketch.frameRate(FRAME_RATE);

			/* Add the editor tools. */
			function setupEditing() {
				addYourPlayerButton = sketch.createButton('Teams');
				addYourPlayerButton.addClass("canvas-button");
				addYourPlayerButton.addClass("md-button");
				addYourPlayerButton.size(90, 40);
				addYourPlayerButton.position(20, BUTTON_Y_OFFSET);
				addYourPlayerButton.mousePressed(addYourPlayer);

				movementButton = sketch.createButton('Movement');
				movementButton.addClass("canvas-button");
				movementButton.addClass("md-button");
				movementButton.size(90, 40);
				movementButton.position(40 + addYourPlayerButton.width, BUTTON_Y_OFFSET);
				movementButton.mousePressed(openBottomSheet);

				displayButton = sketch.createButton('Display');
				displayButton.addClass("canvas-button");
				displayButton.addClass("md-button");
				displayButton.size(90, 40);
				displayButton.position(60 + addYourPlayerButton.width + movementButton.width, BUTTON_Y_OFFSET);
				displayButton.mousePressed(openDisplay);

				saveButton = sketch.createButton('Save Play');
				saveButton.addClass("canvas-button");
				saveButton.addClass("md-button");
				saveButton.size(90, 40);
				saveButton.position(80 + addYourPlayerButton.width + movementButton.width + displayButton.width, BUTTON_Y_OFFSET);
				saveButton.mousePressed(savePlay);

				recordButton = sketch.createElement('i', 'fiber_manual_record');
				recordButton.addClass("material-icons");
				recordButton.addClass("md-36");
				recordButton.addClass("record-button");
				recordButton.size(GOOGLE_BUTTON_WIDTH, 30);
				recordButton.position($(window).width() - recordButton.width - 10, BUTTON_Y_OFFSET + 3);
				recordButton.mousePressed(record);

				trashCan = sketch.createElement('i', 'delete');
				trashCan.addClass("material-icons");
				trashCan.addClass("md-36");
				trashCan.addClass("red");
				trashCan.position($(window).width()/2 - 17, BUTTON_Y_OFFSET);
				trashCan.elt.style.visibility = "hidden";
			}

			/* Add owner sharing tools. */
			function setupSharing() {
				var shareButton = sketch.createButton('Share Play');
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
				playButton = sketch.createElement('i', 'play_arrow');
				playButton.addClass("material-icons");
				playButton.addClass("md-36");
				playButton.addClass("purple");
				playButton.size(GOOGLE_BUTTON_WIDTH, 30);
				playButton.position($(window).width() - playButton.width - GOOGLE_BUTTON_WIDTH - 20, BUTTON_Y_OFFSET + 2);
				playButton.mousePressed(play);

				playbackTimeSelect = sketch.createInput(3.0);
				playbackTimeSelect.elt.type = "number";
				playbackTimeSelect.elt.min = 0.1;
				playbackTimeSelect.elt.max = 25.0;
				playbackTimeSelect.elt.step = 0.1;
				playbackTimeSelect.addClass('playback-time');
				playbackTimeSelect.changed(setPlaybackTime);
				playbackTimeSelect.size(45, 30);
				playbackTimeSelect.position($(window).width() - 30 - GOOGLE_BUTTON_WIDTH - playButton.width - playbackTimeSelect.width, BUTTON_Y_OFFSET + 3);

				var playbackTimeLabel = sketch.createP('PLAYBACK TIME: ');
				playbackTimeLabel.addClass('playback-time-label');
				playbackTimeLabel.size(100, 40);
				playbackTimeLabel.position($(window).width() - 34 - GOOGLE_BUTTON_WIDTH - playButton.width - playbackTimeSelect.width - playbackTimeLabel.width, BUTTON_Y_OFFSET + 1.5);
			
				currentTimeLabel = sketch.createDiv('');
				currentTimeLabel.addClass('current-time');
				currentTimeLabel.size(40, 40);
				currentTimeLabel.position($(window).width() - 50 - GOOGLE_BUTTON_WIDTH - playButton.width - playbackTimeSelect.width - playbackTimeLabel.width - currentTimeLabel.width, BUTTON_Y_OFFSET + 5);
				currentTimeLabel.elt.style.visibility = "hidden";
			}

			setupPlaying();

			/* Called if we determine that we are loading a previously created play. */
			function loadPlay() {
				var playRes = $resource("/load-play");
				playRes.get({email: userEmail, id: playId, owned: userOwned}, function(response) {
					var play = response;
					var oldPlayers = JSON.parse(play.players);
					fullField = false;
					if (play.fieldType === "1") {
						fullField = true;
					}
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
					var playNamesRes = $resource("/play-names", {}, {query: {method:'GET', isArray: true}});
					playNamesRes.query({email: userEmail, ids: [playId]}, function(response) {
						playName = response[0].name
					}, function errorHandling(err) {
						console.log("Failed to fetch play names.");
					});
				}, function errorHandling(err) {
					console.log("Failed to fetch play with id " + playId + ".");
				});
			}

			// CALLBACK FUNCTIONS FOR CREATIVE TOOLS
			function openBottomSheet() {
				$mdBottomSheet.show({
					templateUrl: 'components/dialog-boxes/bottom-sheet.html',
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
					templateUrl: 'components/dialog-boxes/display-settings.html',
					controller: 'DisplaySettingsController',
					parent: angular.element(document.body),
					locals: {
						isAdvanced: advanced,
						isTrail: trail,
						isBall: ballAdded,
						isWhiteBackground: whiteBackground,
						isFullField: fullField,
						isAtHistoryStart: atHistoryStart
					}
				})
				.then(function(answer) {
					var settings = JSON.parse(answer);
					recording = settings.recording;
					advanced = settings.advanced;
					trail = settings.trail;
					ballAdded = settings.ball;
					whiteBackground = settings.whiteBackground;
					fullField = settings.fullField;
					atHistoryStart = settings.atHistoryStart;
				}, function() {
					console.log("Chose not to save display settings.");
				});
			}

			function addYourPlayer() {
				$mdDialog.show({
					templateUrl: 'components/dialog-boxes/player-picker.html',
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
			    				if (players[j].startingNumber === currPlayer.startingNumber && players[j].attackTeam === currPlayer.team) {
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
				if (playing) {
					paused = !paused;
					if (paused) {
						playButton.elt.innerHTML = "play_arrow";
					} else {
						playButton.elt.innerHTML = "pause";
					}
				} else {
					playButton.elt.innerHTML = "pause";
					currentTimeLabel.elt.style.visibility = "visible";
					playing = true;
					currFrame = 0;
				}
			}

			function sharePlay() {
				$mdDialog.show({
					templateUrl: 'components/dialog-boxes/share-play.html',
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
					templateUrl: 'components/dialog-boxes/save-play.html',
					controller: 'SavePlayController',
					parent: angular.element(document.body),
					locals: {
						name: playName
					}
			    })
			    .then(function(result) {
			    	var email = document.getElementById('user-email').innerHTML;
			    	var name = JSON.parse(result).name;
			    	playName = name;
					var playerData = [];
					for (var i = 0; i < players.length; i++) {
						var player = players[i];
						var newPlayer = {id: player.id, x: player.x, y: player.y, attackTeam: player.attackTeam, history: player.history, currentNumber: player.currentNumber, startingNumber: player.startingNumber, color: player.color, shape: player.shape};
						playerData.push(newPlayer);
					}
					var ballData = {x: ball.x, y: ball.y, history: ball.history};
					if (playId === -1) {
						var newPlayRes = $resource('/create-new-play');
						var fieldMode = 0;
						if (fullField) {
							fieldMode = 1;
						}
						newPlayRes.save({userEmail: email, userPlayers: playerData, userBall: ballData, playName: name, fieldType: fieldMode}, function(response) {
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
		}

		function record() {
			recording = !recording;
			if (recording) {
				recordButton.addClass("red");
			} else {
				recordButton.removeClass("red");
			}
		}
		// END CALLBACK FUNCTIONS FOR CREATIVE TOOLS

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
			currentTimeLabel.elt.textContent = (currFrame / 60.0).toFixed(1);
			for (var i = 0; i < players.length; i++) {
				var player = players[i];
				animateObject(player, playTime);
			}

			if (ballAdded) animateObject(ball, playTime);

			// Using actual frames to scale currFrame to account for p5js slowdown bug in full field mode
			if (!paused) {
				if (fullField && actualFrames % 5 === 0) {
					currFrame += 2;
				} else {
					currFrame++;
				}
				actualFrames++;
			}
			if (currFrame > framesToShow) {
				playing = false;
				playButton.elt.innerHTML = "play_arrow";
				setTimeout(function() {
					currentTimeLabel.elt.style.visibility = "hidden";
				}, CURRENT_TIME_DISPLAY_DELAY);
				currFrame = -1;
				actualFrames = 0;
			}
		}

		function getScale() {
			if (fullField) {
				return ($(window).height() - CANVAS_OFFSET_FROM_TOP) * FIELD_DIMENIONS_RATIO;
			} else {
				return $(window).width();
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
	
				newPosition.x = currPosition.x * getScale();
				newPosition.y = currPosition.y * getScale();
				if (trail) {
					if (atHistoryStart && allHistory.length > 1) {
						showHistory(allHistory, allHistory.length - 1, true, player);
					} else {
						showHistory(allHistory, index, true, player);
					}
				}

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
				if (trail && atHistoryStart && history.length > 0) {
					for (var j = 0; j < history.length; j++) {
						showHistory(history[j].movement, history[j].movement.length - 1, false, player);
					}
				}

				// If we are before the start of a section, position should be at the start of that section
				if (sectionType === SECTION_TYPES.BEFORE_START) {
					newPosition.x = history[sectionNumber].movement[0].x * getScale();
					newPosition.y = history[sectionNumber].movement[0].y * getScale();

				// If we are in the middle of a section, position should be at a scaled point along the direct line between
				// the start and end of the section.
				} else if (sectionType === SECTION_TYPES.IN_MIDDLE) {
					var section = history[sectionNumber];
					var startTime = section.startPercentage * playTime;
					var endTime = section.endPercentage * playTime;

					var start = section.movement[0];
					var newStart = {};
					newStart.x = start.x * getScale();
					newStart.y = start.y * getScale();

					var end = section.movement[section.movement.length - 1];
					var newEnd = {};
					newEnd.x = end.x * getScale();
					newEnd.y = end.y * getScale();

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
					newPosition.x = section.movement[section.movement.length - 1].x * getScale();
					newPosition.y = section.movement[section.movement.length - 1].y * getScale();
				}
			}

			player.move(newPosition.x, newPosition.y, false, fullField);
		}

		/* Draws a trail for given player history array from the start to the point in the history
		array at lengthToShow, using the advanced flag to determine how the trail should look
		and the isUserTeam flag to determine the color of the trail. */
		function showHistory(history, lengthToShow, advanced, player) {
			sketch.stroke(player.color.red, player.color.green, player.color.blue);
			sketch.fill(player.color.red, player.color.green, player.color.blue);
			sketch.strokeWeight(3);
			var scaleLength = getScale();
			if (advanced) {
				for (var i = 0; i <= lengthToShow; i++) {
					if (i !== 0 && i < history.length) sketch.line(history[i-1].x * scaleLength, history[i-1].y * scaleLength, history[i].x * scaleLength, history[i].y * scaleLength);
				}
			} else {
				if (history.length >= 2) {
					var start = history[0];
					var end = history[lengthToShow];
					sketch.line(start.x * scaleLength, start.y * scaleLength, end.x * scaleLength, end.y * scaleLength);
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
				if (!player.display(fullField, atHistoryStart)) {
					players.splice(x, 1);
					removeTrash();
					delete player;
					x--;
				}
			}

			if (ballAdded) {
				if (moved === false) moved = handleDragMovement(ball, recording);
				if (!ball.display(fullField, atHistoryStart)) {
					ballAdded = false;
					removeTrash();
					delete ball;
					ball = new Ball(sketch);
				}
			}
		}

		/* Sets up the soccer field on the screen. */
		function drawInitialField() {
			sketch.noFill();

			if (!fullField) {
				var currFrameWidth = $(window).width();
				if (currWindowSize.width !== currFrameWidth) {
					canvas.size(currFrameWidth, $(window).height() - CANVAS_Y_OFFSET);
					canvas.position(0, CANVAS_Y_OFFSET);
					currWindowSize.width = currFrameWidth;
				}

				//goal
				sketch.stroke(255, 255, 255);
				sketch.strokeWeight(4);
				sketch.line(currFrameWidth/2 - 0.0534*currFrameWidth, 0, currFrameWidth/2 + 0.0534*currFrameWidth, 0);

				if (!whiteBackground) {
					sketch.background("green");
				} else {
					sketch.background("white");
					sketch.stroke(0, 0, 0);
				}

				//Corner flags
				sketch.arc(0, 0, 30, 30, 0, 1.57);
				sketch.arc(currFrameWidth, 0, 30, 30, 1.57, 3.14);

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
			} else {
				var currFrameHeight = $(window).height() - CANVAS_OFFSET_FROM_TOP;
				var scaledWidth = currFrameHeight * (115/75);
				if (currWindowSize.height !== currFrameHeight) {
					canvas.size(scaledWidth, currFrameHeight);
					canvas.position(0, CANVAS_Y_OFFSET);
					currWindowSize.width = currFrameWidth;
				}

				//LEFT SIDE
				//goal
				sketch.stroke(255, 255, 255);
				sketch.strokeWeight(3);
				sketch.line(0, currFrameHeight/2 - 0.0534*currFrameHeight, 0, currFrameHeight/2 + 0.0534*currFrameHeight);

				if (!whiteBackground) {
					sketch.background("green");
				} else {
					sketch.background("white");
					sketch.stroke(0, 0, 0);
				}

				//Corner flags
				sketch.arc(0, 0, 30, 30, 0, 1.57);
				sketch.arc(0, currFrameHeight, 30, 30, 4.71, 0);

				//midfield
				sketch.strokeWeight(2);
				sketch.line(scaledWidth/2, 0, scaledWidth/2, currFrameHeight);
				sketch.arc(scaledWidth/2, currFrameHeight/2, 0.24 * currFrameHeight, 0.24 * currFrameHeight, 0, 6.28);
				sketch.strokeWeight(3);
				sketch.ellipse(scaledWidth/2, currFrameHeight/2, 5, 5);

				//Outer box
				sketch.line(0, currFrameHeight/2 - 0.2943*currFrameHeight, 0.2409*currFrameHeight, currFrameHeight/2 - 0.2943*currFrameHeight);
				sketch.line(0, currFrameHeight/2 + 0.2943*currFrameHeight, 0.2409*currFrameHeight, currFrameHeight/2 + 0.2943*currFrameHeight);
				sketch.line(0.2409*currFrameHeight, currFrameHeight/2 - 0.2943*currFrameHeight, 0.2409*currFrameHeight, currFrameHeight/2 + 0.2943*currFrameHeight);
			
				//Inner box
				sketch.line(0, currFrameHeight/2 + 0.1337*currFrameHeight, 0.0803*currFrameHeight, currFrameHeight/2 + 0.1337*currFrameHeight);
				sketch.line(0, currFrameHeight/2 - 0.1337*currFrameHeight, 0.0803*currFrameHeight, currFrameHeight/2 - 0.1337*currFrameHeight);
				sketch.line(0.0803*currFrameHeight, currFrameHeight/2 - 0.1337*currFrameHeight, 0.0803*currFrameHeight, currFrameHeight/2 + 0.1337*currFrameHeight);

				//Penalty spot and arc outside box
				sketch.ellipse(0.1606*currFrameHeight, currFrameHeight/2, 5, 5);
				sketch.arc(0.1606*currFrameHeight, currFrameHeight/2, 0.2671*currFrameHeight, 0.2671*currFrameHeight, -0.90, 0.9);

				sketch.stroke(0, 0, 0);

				//sidelines
				sketch.strokeWeight(3);
				sketch.line(0, 0, 0, currFrameHeight/2 - 0.0534*currFrameHeight);
				sketch.line(0, currFrameHeight/2 + 0.0534*currFrameHeight, 0, currFrameHeight);
				sketch.line(0, 0, scaledWidth, 0);
				sketch.line(0, currFrameHeight, scaledWidth, currFrameHeight);

				//RIGHT SIDE
				//goal
				sketch.stroke(255, 255, 255);
				sketch.line(scaledWidth, currFrameHeight/2 - 0.0534*currFrameHeight, scaledWidth, currFrameHeight/2 + 0.0534*currFrameHeight);

				if (whiteBackground) sketch.stroke(0, 0, 0);

				//Corner flags
				sketch.arc(scaledWidth, 0, 30, 30, 1.57, 3.14); 
				sketch.arc(scaledWidth, currFrameHeight, 30, 30, 3.14, 4.71); 

				//Outer box
				sketch.line(scaledWidth, currFrameHeight/2 - 0.2943*currFrameHeight, scaledWidth - 0.2409*currFrameHeight, currFrameHeight/2 - 0.2943*currFrameHeight);
				sketch.line(scaledWidth, currFrameHeight/2 + 0.2943*currFrameHeight, scaledWidth - 0.2409*currFrameHeight, currFrameHeight/2 + 0.2943*currFrameHeight);
				sketch.line(scaledWidth - 0.2409*currFrameHeight, currFrameHeight/2 - 0.2943*currFrameHeight, scaledWidth - 0.2409*currFrameHeight, currFrameHeight/2 + 0.2943*currFrameHeight);
			
				//Inner box
				sketch.line(scaledWidth, currFrameHeight/2 + 0.1337*currFrameHeight, scaledWidth - 0.0803*currFrameHeight, currFrameHeight/2 + 0.1337*currFrameHeight);
				sketch.line(scaledWidth, currFrameHeight/2 - 0.1337*currFrameHeight, scaledWidth - 0.0803*currFrameHeight, currFrameHeight/2 - 0.1337*currFrameHeight);
				sketch.line(scaledWidth - 0.0803*currFrameHeight, currFrameHeight/2 - 0.1337*currFrameHeight, scaledWidth - 0.0803*currFrameHeight, currFrameHeight/2 + 0.1337*currFrameHeight);

				//Penalty spot and arc outside box
				sketch.ellipse(scaledWidth - 0.1606*currFrameHeight, currFrameHeight/2, 5, 5);
				sketch.arc(scaledWidth - 0.1606*currFrameHeight, currFrameHeight/2, 0.2671*currFrameHeight, 0.2671*currFrameHeight, 2.2, 4.05);

				sketch.stroke(0, 0, 0);

				//sidelines
				sketch.line(scaledWidth, 0, scaledWidth, currFrameHeight/2 - 0.0534*currFrameHeight);
				sketch.line(scaledWidth, currFrameHeight/2 + 0.0534*currFrameHeight, scaledWidth, currFrameHeight);
			}
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
			if (sketch.mouseIsPressed && player.isMoving() === false && player.shouldMove(mousePressStartX, mousePressStartY, fullField)) {
				player.setMovement(true, recording);
				if (!recording) player.clearHistory();
			} 
			if (player.isMoving()) {
				player.move(sketch.mouseX, sketch.mouseY, recording, fullField);
				moved = true;
				drawTrash();
			} 
			if (sketch.mouseIsPressed === false) {
				mouseCurrentlyPressed = false;
				if (player.isMoving()) {
					player.setMovement(false, recording);
					removeTrash();
				}
			} 
			return moved;
		}

		function drawTrash() {
			if (trashCan) trashCan.elt.style.visibility = "visible";
		}		

		function removeTrash() {
			if (trashCan) trashCan.elt.style.visibility = "hidden";
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

