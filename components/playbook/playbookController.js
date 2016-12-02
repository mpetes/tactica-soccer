'use strict';

soccerDraw.controller('PlaybookController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

  	$scope.playbook = {};
  	$scope.playbook.myPlays = [];
  	$scope.playbook.sharedPlays = [];

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
			for (var id in plays.edit) {
				playIds.push(id);
			}
			var playNamesRes = $resource("/play-names", {}, {query: {method:'GET', isArray: true}});
			playNamesRes.query({email: $scope.main.email, ids: playIds}, function(response) {
				for (var i = 0; i < response.length; i++) {
					var playbookInfo = {};
					playbookInfo.id = response[i].id;
					playbookInfo.name = response[i].name;
					playbookInfo.owner = response[i].owner;
					playbookInfo.date = response[i].date;
					if (plays.owned.indexOf(response[i].id) !== -1) {
						playbookInfo.edit = "Yes";
						$scope.playbook.myPlays.push(playbookInfo);
					} else if (plays.edit.indexOf(response[i].id) !== -1) {
						playbookInfo.edit = "Yes";
						$scope.playbook.sharedPlays.push(playbookInfo);
					} else {
						playbookInfo.edit = "No";
						$scope.playbook.sharedPlays.push(playbookInfo);
					}
				}
			}, function errorHandling(err) {
				console.log("Failed to fetch play names.");
			});
		}, function errorHandling(err) {
			console.log("Failed to fetch previous user plays.");
		});
	}

	$scope.viewPlay = function(playId, playAccess) {
		var accessLevel = 0;
		if (playAccess === "Yes") accessLevel = 1;
		$location.path('/Playbook/' + playId + "/" + accessLevel);
	}
}]);