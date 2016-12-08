/* Defines a player on the screen. */
function Player(sketch, attackTeam, id, number, color, shape) {

	/* Set variables that will need to be stored for this player. */
	if (attackTeam) {
		this.x = 0.1 + 0.01*(number%15);
		this.y = 0.022 + 0.02*(number%15);
	} else {
		this.x = 0.4 - 0.01*(number%15);
		this.y = 0.02 + 0.02*(number%15);
	}
	this.attackTeam = attackTeam;
	this.id = id;
	this.history = [];
	this.currentNumber = number;
	this.startingNumber = number;
	this.color = color;
	this.shape = shape;

	/* Set local variables that we will not need to store. */
	var radius = 13;
	var moving = false;
	var numberDisplay = sketch.createP();
	numberDisplay.height = 5;
	numberDisplay.width = 5;
	numberDisplay.addClass('player-number');

	this.determineStartTimes = function(playTime) {
		for (var i = 0; i < this.history.length; i++) {
			var section = this.history[i];
			if (!section.timesPicked) {
				if (i === 0) {
					section.startPercentage = 0;
					section.endPercentage = 1 / this.history.length;
				} else {
					section.startPercentage = this.history[i-1].endPercentage;
					var interval = (1 - section.startPercentage) / (this.history.length - i);
					section.endPercentage = section.startPercentage + interval;
				}
				section.startTime = section.startPercentage * playTime;
				section.endTime = section.endPercentage * playTime;
			}
		}
	}

	/* Set whether player is being dragged across the screen. */
	this.setMovement = function(movement, recording) {
		moving = movement;
		if (moving && recording) {
			var vec = new p5.Vector(this.x, this.y);
			var section = [];
			section.push(vec);
			this.history.push({startTime: -1, endTime: -1, startPercentage: -1.0, endPercentage: -1.0, timesPicked: false, movement: section});
		} 
	}

	/* Returns whether player is being dragged across the screen. */
	this.isMoving = function() {
		return moving;
	}

	/* Returns current x and y coordinates of player. */
	this.getPosition = function() {
		return {x: this.x * $(window).width(), y: this.y * $(window).width()};
	}

	/* Moves player to new location defined by newX and newY. If you are recording, please call setMovement prior to moving the player. */
	this.move = function(newX, newY, recording, fullField) {
		if (fullField) {
			var currFrameHeight = $(window).height() - 100;
			var scaledWidth = currFrameHeight * (115/75);
			this.x = parseFloat(newX) / scaledWidth;
			this.y = parseFloat(newY) / scaledWidth;
		} else {
			this.x = parseFloat(newX) / $(window).width();
			this.y = parseFloat(newY) / $(window).width();
		}
		if (recording) {
			var vec = new p5.Vector(this.x, this.y);
			if (vec.x >= 0.0 && vec.x <= 1.0 && vec.y >= 0.0 && vec.y <= 1.0) this.history[this.history.length - 1].movement.push(vec);
		}
		this.display(fullField, false);
	}

	/* Paints the ellipse that represents the player onto the screen. */
	this.display = function(fullField, atHistoryStart) {
		sketch.stroke(this.color.red, this.color.green, this.color.blue);
		sketch.fill(this.color.red, this.color.green, this.color.blue);
		numberDisplay.elt.innerHTML = this.currentNumber.toString();
		var xPercentage = this.x;
		var yPercentage = this.y;
		if (atHistoryStart && this.history.length > 0) {
			sketch.ellipse(this.x * scaleLength, this.y * scaleLength, radius, radius);
			xPercentage = this.history[0].movement[0].x;
			yPercentage = this.history[0].movement[0].y;
		}

		var scaleLength;
		if (fullField) {
			scaleLength = ($(window).height() - 100) * (115/75);
		} else {
			scaleLength = $(window).width();
		}
		if (this.shape === "circle") {
			if (this.currentNumber >= 10) {
				numberDisplay.position(-7.1 + xPercentage * scaleLength, 40.8 + yPercentage * scaleLength);
			} else {
				numberDisplay.position(-3.1 + xPercentage * scaleLength, 40.8 + yPercentage * scaleLength);
			}
			sketch.ellipse(xPercentage * scaleLength, yPercentage * scaleLength, radius, radius);
		} else if (this.shape === "triangle") {
			if (this.currentNumber >= 10) {
				numberDisplay.position(-6.5 + xPercentage * scaleLength, 44 + yPercentage * scaleLength);
			} else {
				numberDisplay.position(-3.5 + xPercentage * scaleLength, 42 + yPercentage * scaleLength);
			}
			var width = xPercentage * scaleLength;
			var height = yPercentage * scaleLength;
			sketch.triangle(width - radius/1.5, height + radius/1.5, width, height - radius/1.5, width + radius/1.5, height + radius/1.5);
		} else {
			if (this.currentNumber >= 10) {
				numberDisplay.position(xPercentage * scaleLength - 6.5, 41 + yPercentage * scaleLength);
			} else {
				numberDisplay.position(xPercentage * scaleLength - 3, 41 + yPercentage * scaleLength);
			}
			sketch.rect(xPercentage * scaleLength - 0.5*radius, yPercentage * scaleLength - 0.5*radius, radius, radius);
		}
		if (atHistoryStart === true) return this.display(fullField, false); // Show end + beginning of history
		if (this.y <= -0.014 && this.x >= 0.2 && this.x <= 0.8) {
			numberDisplay.elt.innerHTML = "";
			delete numberDisplay;
			return false;
		} else {
			return true;
		}
	}

	/* Returns whether or not the player should be dragged across the screen based on the start point of the mouse press. */
	this.shouldMove = function(mousePressStartX, mousePressStartY, fullField) {
		var scaleLength;
		if (fullField) {
			scaleLength = ($(window).height() - 100) * (115/75);
		} else {
			scaleLength = $(window).width();
		}
		if (this.shape === "circle" || this.shape === "triangle") {
			return (Math.abs(mousePressStartX - this.x * scaleLength) <= (radius-3) && Math.abs(mousePressStartY - this.y * scaleLength) <= (radius-3))
		} else {
			return (Math.abs(mousePressStartX - this.x * scaleLength) <= radius/2 && Math.abs(mousePressStartY - this.y * scaleLength) <= radius/2);
		}
	}

	/* Erases the history of movement. */
	this.clearHistory = function() {
		this.history = [];
	}

	/* Returns an array of arrays of (x, y) coordinates samples at each frame. */
	this.getHistory = function() {
		return this.history;
	}

	this.combineHistory = function() {
		var allHistory = [];
		for (var i = 0; i < this.history.length; i++) {
			for (var j = 0; j < this.history[i].movement.length; j++) {
				allHistory.push(this.history[i].movement[j]);
			}
		}
		return allHistory;
	}

	/* Sets the player's (x, y) coordinate history to be the given history. */
	this.setHistory = function(newHistory) {
		this.history = newHistory;
	}
}
