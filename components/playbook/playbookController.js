'use strict';

soccerDraw.controller('PlaybookController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

  	$scope.playbook = {};

  	$scope.fetchUserPlays = function () {
		var userPlaysRes = $resource("/user-plays");
		userPlaysRes.get({email: $scope.main.email}, function(response) {
			var playIds = [];
			for (var id in response.plays.owned) {
				playIds.push(id);
			}
			for (var id in response.plays.access) {
				playIds.push(id);
			}
			var playNamesRes = $resource("/play-names");
			playNamesRes.get({ids: playIds}, function(response) {
				console.log(response);
			}, function errorHandling(err) {
				console.log("Failed to fetch play names.");
			});
		}, function errorHandling(err) {
			console.log("Failed to fetch previous user plays.");
		});
	}
}]);