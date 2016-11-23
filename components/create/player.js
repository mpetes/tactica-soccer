/* Defines a player on the screen. */
function Player(sketch, attackTeam, id, number, color, shape) {
	if (attackTeam) {
		this.x = 0.3 + 0.01*(number%23);
		this.y = 0.2 + 0.01*(number%23);
	} else {
		this.x = 0.7 - 0.01*(number%23);
		this.y = 0.2 + 0.01*(number%23);
	}
	this.radius = 13;
	this.moving = false;
	this.attackTeam = attackTeam;
	this.id = id;
	this.history = [];
	this.sketch = sketch;
	this.currentNumber = number;
	this.startingNumber = number;
	this.color = color;
	this.shape = shape;
	this.numberDisplay = this.sketch.createP();
	this.numberDisplay.height = 5;
	this.numberDisplay.width = 5;
	this.numberDisplay.addClass('player-number');
	this.startTime = 0.0;

	/* Set whether player is being dragged across the screen. */
	this.setMovement = function(movement) {
		this.moving = movement;
	}

	/* Returns whether player is being dragged across the screen. */
	this.isMoving = function() {
		return this.moving;
	}

	/* Returns the id for this player. */
	this.getId = function() {
		return this.id;
	}

	/* Returns current x and y coordinates of player. */
	this.getPosition = function() {
		return {x: this.x * $(window).width(), y: this.y * $(window).width()};
	}

	/* Moves player to new location defined by newX and newY. */
	this.move = function(newX, newY, recording) {
		this.x = parseFloat(newX) / $(window).width();
		this.y = parseFloat(newY) / $(window).width();
		if (recording) {
			var vec = new p5.Vector(this.x, this.y);
			if (vec.x >= 0.0 && vec.x <= 1.0 && vec.y >= 0.0 && vec.y <= 1.0) this.history.push(vec);
		}
		this.display();
	}

	/* Returns whether this player is a member of the user's team. */
	this.isAttackTeam = function() {
		return this.attackTeam;
	}

	/* Paints the ellipse that represents the player onto the screen. */
	this.display = function() {
		this.sketch.stroke(this.color.red, this.color.green, this.color.blue);
		this.sketch.fill(this.color.red, this.color.green, this.color.blue);
		this.numberDisplay.elt.innerHTML = this.currentNumber.toString();
		if (this.shape === "circle") {
			if (this.currentNumber >= 10) {
				this.numberDisplay.position(-7.1 + this.x * $(window).width(), 30.8 + this.y * $(window).width());
			} else {
				this.numberDisplay.position(-3.1 + this.x * $(window).width(), 30.8 + this.y * $(window).width());
			}
			this.sketch.ellipse(this.x * $(window).width(), this.y * $(window).width(), this.radius, this.radius);
		} else if (this.shape === "triangle") {
			if (this.currentNumber >= 10) {
				this.numberDisplay.position(-6.5 + this.x * $(window).width(), 33 + this.y * $(window).width());
			} else {
				this.numberDisplay.position(-3.5 + this.x * $(window).width(), 33 + this.y * $(window).width());
			}
			var width = this.x * $(window).width();
			var height = this.y * $(window).width();
			this.sketch.triangle(width - this.radius/1.5, height + this.radius/1.5, width, height - this.radius/1.5, width + this.radius/1.5, height + this.radius/1.5);
		} else {
			if (this.currentNumber >= 10) {
				this.numberDisplay.position(this.x * $(window).width(), 37 + this.y * $(window).width());
			} else {
				this.numberDisplay.position(this.x * $(window).width() + 3.5, 37 + this.y * $(window).width());
			}
			this.sketch.rect(this.x * $(window).width(), this.y * $(window).width(), this.radius, this.radius);
		}
	}

	/* Returns whether or not the player should be dragged across the screen based on the start point of the mouse press. */
	this.shouldMove = function(mousePressStartX, mousePressStartY) {
		return (Math.abs(mousePressStartX - this.x * $(window).width()) <= this.radius && Math.abs(mousePressStartY - this.y * $(window).width()) <= this.radius)
	}

	/* Erases the history of movement. */
	this.clearHistory = function() {
		this.history = [];
	}

	/* Returns an array of (x, y) coordinates samples at each frame. */
	this.getHistory = function() {
		return this.history;
	}

	/* Sets the player's (x, y) coordinate history to be the given array. */
	this.setHistory = function(newHistory) {
		this.history = newHistory;
	}
}
