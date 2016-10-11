//'use strict';

soccerDraw.factory('play-creation', ['p5', function(p5) {
	return function (sketch) {

		sketch.setup = function () {
			sketch.createCanvas(1200, 500);
			sketch.background("green");
			//sketch.line(0, 0, width, height);
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

		}

		sketch.draw = function () {
		}

	};
}]);

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope', 'p5',
  function ($scope, $http, $resource, $location, $rootScope, p5) {
  	//console.log(document.getElementById('play-creation'));
}]);

