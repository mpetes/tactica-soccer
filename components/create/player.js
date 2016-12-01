/* Defines a player on the screen. */
function Player(sketch, attackTeam, id, number, color, shape) {

	/* Set variables that will need to be stored for this player. */
	if (attackTeam) {
		this.x = 0.3 + 0.01*(number%23);
		this.y = 0.2 + 0.01*(number%23);
	} else {
		this.x = 0.7 - 0.01*(number%23);
		this.y = 0.2 + 0.01*(number%23);
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
					section.endTime = section.startPercentage + interval;
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
	this.move = function(newX, newY, recording) {
		this.x = parseFloat(newX) / $(window).width();
		this.y = parseFloat(newY) / $(window).width();
		if (recording) {
			var vec = new p5.Vector(this.x, this.y);
			if (vec.x >= 0.0 && vec.x <= 1.0 && vec.y >= 0.0 && vec.y <= 1.0) this.history[this.history.length - 1].movement.push(vec);
		}
		this.display();
	}

	/* Paints the ellipse that represents the player onto the screen. */
	this.display = function() {
		sketch.stroke(this.color.red, this.color.green, this.color.blue);
		sketch.fill(this.color.red, this.color.green, this.color.blue);
		numberDisplay.elt.innerHTML = this.currentNumber.toString();
		if (this.shape === "circle") {
			if (this.currentNumber >= 10) {
				numberDisplay.position(-7.1 + this.x * $(window).width(), 40.8 + this.y * $(window).width());
			} else {
				numberDisplay.position(-3.1 + this.x * $(window).width(), 40.8 + this.y * $(window).width());
			}
			sketch.ellipse(this.x * $(window).width(), this.y * $(window).width(), radius, radius);
		} else if (this.shape === "triangle") {
			if (this.currentNumber >= 10) {
				numberDisplay.position(-6.5 + this.x * $(window).width(), 42 + this.y * $(window).width());
			} else {
				numberDisplay.position(-3.5 + this.x * $(window).width(), 42 + this.y * $(window).width());
			}
			var width = this.x * $(window).width();
			var height = this.y * $(window).width();
			sketch.triangle(width - radius/1.5, height + radius/1.5, width, height - radius/1.5, width + radius/1.5, height + radius/1.5);
		} else {
			if (this.currentNumber >= 10) {
				numberDisplay.position(this.x * $(window).width(), 47 + this.y * $(window).width());
			} else {
				numberDisplay.position(this.x * $(window).width() + 3.5, 47 + this.y * $(window).width());
			}
			sketch.rect(this.x * $(window).width(), this.y * $(window).width(), radius, radius);
		}
	}

	/* Returns whether or not the player should be dragged across the screen based on the start point of the mouse press. */
	this.shouldMove = function(mousePressStartX, mousePressStartY) {
		return (Math.abs(mousePressStartX - this.x * $(window).width()) <= radius && Math.abs(mousePressStartY - this.y * $(window).width()) <= radius)
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
