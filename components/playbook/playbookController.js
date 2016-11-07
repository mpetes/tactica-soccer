'use strict';

soccerDraw.controller('PlaybookController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

  	$scope.playbook = {};

  	$scope.fetchUserPlays = function () {
		var userPlaysRes = $resource("/user-plays");
		userPlaysRes.get({email: $scope.main.email}, function(response) {
			$scope.safeApply(function() {
				$scope.main.userPlays = JSON.parse(response.plays);
			});
		}, function errorHandling(err) {
			console.log("Failed to fetch previous user plays.");
		});
	}
}]);