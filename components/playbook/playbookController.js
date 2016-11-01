'use strict';

soccerDraw.controller('PlaybookController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

  	$scope.playbook = {};
  	console.log("Loading playbook controller");

  	$scope.fetchUserPlays = function () {
		var userPlaysRes = $resource("/user-plays");
		console.log("Fetching user plays.");
		userPlaysRes.get({email: $scope.main.email}, function(response) {
			$scope.safeApply(function() {
				$scope.main.userPlays = JSON.parse(response.plays);
			});
			console.log("Logged-in user " + $scope.main.email + " has plays with ids " + $scope.main.userPlays);
		}, function errorHandling(err) {
			console.log("Failed to fetch previous user plays.");
		});
	}



}]);