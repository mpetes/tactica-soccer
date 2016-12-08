/* Defines the ball on the screen. */
function Ball(sketch) {
	this.x = 0.2;
	this.y = 0.1;
	this.history = [];
	this.color = {red: 255, green: 255, blue: 255};
	var radius = 10;
	var moving = false;

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

	this.display = function(fullField, atHistoryStart) {
		sketch.stroke(this.color.red, this.color.green, this.color.blue);
		sketch.fill(0, 0, 0);
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

		sketch.ellipse(this.x * scaleLength, this.y * scaleLength, radius, radius);
		if (this.y <= -0.014 && this.x >= 0.4 && this.x <= 0.6) {
			return false;
		} else {
			return true;
		}
	}

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

	this.setHistory = function(newHistory) {
		this.history = newHistory;
	}

	this.clearHistory = function() {
		this.history = [];
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

	this.getHistory = function() {
		return this.history;
	}

	this.shouldMove = function(mousePressStartX, mousePressStartY, fullField) {
		var scaleLength;
		if (fullField) {
			scaleLength = ($(window).height() - 100) * (115/75);
		} else {
			scaleLength = $(window).width();
		}
		return (Math.abs(mousePressStartX - this.x * scaleLength) <= radius && Math.abs(mousePressStartY - this.y * scaleLength) <= radius)
	}

	this.setMovement = function(movement, recording) {
		moving = movement;
		if (moving && recording) {
			var vec = new p5.Vector(this.x, this.y);
			var section = [];
			section.push(vec);
			this.history.push({startTime: -1, endTime: -1, timesPicked: false, movement: section});
		} 
	}

	this.isMoving = function() {
		return moving;
	}

	this.getPosition = function() {
		return {x: this.x * $(window).width(), y: this.y * $(window).width()};
	}

}