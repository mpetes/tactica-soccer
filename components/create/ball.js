/* Defines the ball on the screen. */
function Ball(sketch) {
	this.x = 0.2;
	this.y = 0.1;
	this.history = [];
	this.color = {red: 255, green: 255, blue: 255};
	this.radius = 10;
	this.sketch = sketch;
	this.moving = false;

	this.display = function() {
		this.sketch.stroke(this.color.red, this.color.green, this.color.blue);
		this.sketch.fill(0, 0, 0);
		this.sketch.ellipse(this.x * $(window).width(), this.y * $(window).width(), this.radius, this.radius);
	}

	this.move = function(newX, newY, recording) {
		this.x = parseFloat(newX) / $(window).width();
		this.y = parseFloat(newY) / $(window).width();
		if (recording) {
			var vec = new p5.Vector(this.x, this.y);
			if (vec.x >= 0.0 && vec.x <= 1.0 && vec.y >= 0.0 && vec.y <= 1.0) this.history.push(vec);
		}
		this.display();
	}

	this.setHistory = function(newHistory) {
		this.history = newHistory;
	}

	this.clearHistory = function() {
		this.history = [];
	}

	this.getHistory = function() {
		return this.history;
	}

	this.shouldMove = function(mousePressStartX, mousePressStartY) {
		return (Math.abs(mousePressStartX - this.x * $(window).width()) <= this.radius && Math.abs(mousePressStartY - this.y * $(window).width()) <= this.radius)
	}

	this.setMovement = function(movement) {
		this.moving = movement;
	}

	this.isMoving = function() {
		return this.moving;
	}

	this.getPosition = function() {
		return {x: this.x * $(window).width(), y: this.y * $(window).width()};
	}

}