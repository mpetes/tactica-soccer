//'use strict';

soccerDraw.factory('play-creation', ['p5', function(p5) {
	return function (sketch) {

		sketch.setup = function () {
			sketch.createCanvas(1200, 500);
			sketch.background("green");
			//sketch.line(0, 0, width, height);

		}

		sketch.draw = function () {
		}

	};
}]);

soccerDraw.controller('CreateController', ['$scope', '$http', '$resource', '$location', '$rootScope', 'p5',
  function ($scope, $http, $resource, $location, $rootScope, p5) {
  	//console.log(document.getElementById('play-creation'));
}]);

