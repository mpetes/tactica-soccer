/* Defines a player on the screen. */
function Player(sketch, userTeam, id) {
	this.x = 200;
	this.y = 200;
	this.radius = 13;
	this.moving = false;
	this.userTeam = userTeam;
	this.id = id;
	this.history = [];
	this.sketch = sketch;

	/* Set whether player is being dragged across the screen. */
	this.setMovement = function(movement) {
		this.moving = movement;
	}

	/* Returns the id for this player. */
	this.getId = function() {
		return this.id;
	}

	/* Returns whether player is being dragged across the screen. */
	this.isMoving = function() {
		return this.moving;
	}

	/* Moves player to new location defined by newX and newY. */
	this.move = function(newX, newY, recording) {
		this.x = newX;
		this.y = newY;
		if (recording) this.history.push(new p5.Vector(this.x, this.y));
		this.display();
	}

	this.isUserTeam = function() {
		return this.userTeam;
	}

	/* Paints the ellipse that represents the player onto the screen. */
	this.display = function() {
		if (this.userTeam) {
			this.sketch.stroke(232, 222, 42);
			this.sketch.fill(232, 222, 42);
		} else {
			this.sketch.stroke(17,42,38);
			this.sketch.fill(17,42,38);
		}
		this.sketch.ellipse(this.x, this.y, this.radius, this.radius);
	}

	/* Returns whether or not the player should be dragged across the screen based on the start point of the mouse press. */
	this.shouldMove = function(mousePressStartX, mousePressStartY) {
		return (Math.abs(mousePressStartX - this.x) <= this.radius && Math.abs(mousePressStartY - this.y) <= this.radius)
	}

	/* Erases the history of movement. */
	this.clearHistory = function() {
		this.history = [];
	}

	this.getHistory = function() {
		return this.history;
	}

	this.setHistory = function(newHistory) {
		this.history = newHistory;
	}
}
