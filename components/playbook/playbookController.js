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
			for (var i = 0; i < plays.owned.length; i++) {
				var id = plays.owned[i];
				playIds.push(id);
			}
			for (var i = 0; i < plays.access.length; i++) {
				var id = plays.access[i];
				playIds.push(id);
			}
			for (var i = 0; i < plays.edit.length; i++) {
				var id = plays.edit[i];
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
					if (plays.owned.indexOf(parseInt(response[i].id)) !== -1) {
						playbookInfo.edit = 1;
						playbookInfo.canEdit = "Yes";
						$scope.playbook.myPlays.push(playbookInfo);
					} else if (plays.edit.indexOf(parseInt(response[i].id)) !== -1) {
						playbookInfo.edit = 1;
						playbookInfo.canEdit = "Yes";
						$scope.playbook.sharedPlays.push(playbookInfo);
					} else {
						playbookInfo.edit = 0;
						playbookInfo.canEdit = "No";
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
		$location.path('/Playbook/' + playId + "/" + playAccess);
	}
}]);