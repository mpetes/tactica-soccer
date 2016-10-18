

soccerDraw.factory('play-creation', ['p5', function(p5) {
	return function (sketch) {
		players = [];
		mousePressStartX = -100;
		mousePressStartY = -100;
		mouseCurrentlyPressed = false;

		sketch.setup = function () {
			sketch.createCanvas(1200, 500);
			sketch.frameRate(60);
			drawInitialField();

			addYourPlayerButton = sketch.createButton('Add Your Player');
			addYourPlayerButton.position(10, 550);
			addYourPlayerButton.mousePressed(addYourPlayer);

			addOpposingPlayerButton = sketch.createButton('Add Opposing Player');
			addOpposingPlayerButton.position(20 + addYourPlayerButton.width, 550);
			addOpposingPlayerButton.mousePressed(addOpposingPlayer);


			function addYourPlayer() {
				var player = new Player(true);
				players.push(player);
			}

			function addOpposingPlayer() {
				var player = new Player(false);
				players.push(player);
			}
		}

		function drawInitialField() {
			sketch.background("green");
			sketch.stroke(0, 0, 0);
			sketch.strokeWeight(4);

			//sidelines
			sketch.line(0, 0, 1200, 0);
			sketch.line(0, 0, 0, 500);
			sketch.line(1200, 0, 1200, 500);
			sketch.line(0, 500, 1200, 500);

			sketch.stroke(255, 255, 255);

			//goal
			sketch.line(535.1, 0, 664.9, 0);

			//Outer box
			sketch.line(243.2, 0, 243.2, 291.9);
			sketch.line(956.8, 0, 956.8, 291.9);
			sketch.line(243.2, 291.9, 956.8, 291.9);

			//Inner box
			sketch.line(762.2, 0, 762.2, 97.3);
			sketch.line(437.8, 0, 437.8, 97.3);
			sketch.line(437.8, 97.2, 762.2, 97.3);

			//Penalty spot and arc outside box
			sketch.ellipse(600, 194.6, 5, 5);
			sketch.noFill();
			sketch.arc(600, 194.6, 324.4, 324.4, 0.65, 2.48);

			//Corner flags
			sketch.stroke(0, 0, 0);
			sketch.strokeWeight(2);
			sketch.arc(0, 0, 30, 30, 0, 1.57);
			sketch.arc(1200, 0, 30, 30, 1.57, 3.14);

		}

		function Player(yourTeam) {
			this.x = 200;
			this.y = 200;
			this.radius = 12;
			this.moving = false;
			this.yourTeam = yourTeam;

			this.setMovement = function(movement) {
				this.moving = movement;
			}

			this.isMoving = function() {
				return this.moving;
			}

			this.move = function(newX, newY) {
				this.x = newX;
				this.y = newY;
				this.display();
			}

			this.display = function() {
				if (this.yourTeam) {
					sketch.stroke(0, 0, 0);
					sketch.fill(189, 32, 49);
				} else {
					sketch.stroke(0, 0, 0);
					sketch.fill(0, 0, 0);
				}
				sketch.ellipse(this.x, this.y, this.radius, this.radius);
			}

			this.shouldMove = function() {
				return (Math.abs(mousePressStartX - this.x) <= this.radius && Math.abs(mousePressStartY - this.y) <= this.radius)
			}
		}

		function setPressStartPoint() {
			mousePressStartX = sketch.mouseX;
			mousePressStartY = sketch.mouseY;
			mouseCurrentlyPressed = true;
		}

		sketch.draw = function () {
			drawInitialField();
			moved = false;
			for (var x = 0; x < players.length; x++) {
				var player = players[x];

				if (mouseCurrentlyPressed === false && sketch.mouseIsPressed) {
					setPressStartPoint();
				}
				if (sketch.mouseIsPressed && player.isMoving() === false && player.shouldMove()) {
					player.setMovement(true);
				} 
				if (player.isMoving()) {
					player.move(sketch.mouseX, sketch.mouseY);
				} 
				if (sketch.mouseIsPressed === false) {
					mouseCurrentlyPressed = false;
					if (player.isMoving()) player.setMovement(false);
				} 
				
				player.display();
			}
		}
	};


}]);

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope', 'p5',
  function ($scope, $http, $resource, $location, $rootScope, p5) {
  	var sketch = document.getElementById('play-creation');
}]);

