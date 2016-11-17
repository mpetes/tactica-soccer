'use strict';

soccerDraw.controller('PlaybookController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

  	$scope.playbook = {};

  	$scope.fetchUserPlays = function () {
		var userPlaysRes = $resource("/user-plays");
		userPlaysRes.get({email: $scope.main.email}, function(response) {
			var plays = JSON.parse(response.plays);
			var playIds = [];
			for (var id in plays.owned) {
				playIds.push(id);
			}
			for (var id in plays.access) {
				playIds.push(id);
			}
			var playNamesRes = $resource("/play-names", {}, {query: {method:'GET', isArray: true}});
			playNamesRes.query({email: $scope.main.email, ids: playIds}, function(response) {
				$scope.main.userPlays = {};
				$scope.main.userPlays.owned = [];
				$scope.main.userPlays.access = [];
				for (var i = 0; i < response.length; i++) {
					if (response[i].owner === $scope.main.email) {
						$scope.main.userPlays.owned.push(response[i]);
					} else {	
						$scope.main.userPlays.access.push(response[i]);
					}
				}
			}, function errorHandling(err) {
				console.log("Failed to fetch play names.");
			});
		}, function errorHandling(err) {
			console.log("Failed to fetch previous user plays.");
		});
	}
}]);