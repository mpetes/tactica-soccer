/* Defines a player on the screen. */
function Player(sketch, userTeam, id, number, color) {
	this.x = 0.3;
	this.y = 0.2;
	this.radius = 13;
	this.moving = false;
	this.userTeam = userTeam;
	this.id = id;
	this.history = [];
	this.sketch = sketch;
	this.number = number;
	this.color = color;

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
	this.isUserTeam = function() {
		return this.userTeam;
	}

	/* Paints the ellipse that represents the player onto the screen. */
	this.display = function() {
		this.sketch.stroke(color.red, color.green, color.blue);
		this.sketch.fill(color.red, color.green, color.blue);
		this.sketch.ellipse(this.x * $(window).width(), this.y * $(window).width(), this.radius, this.radius);
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
