soccerDraw.controller('BottomSheetController', BottomSheetController);

BottomSheetController.$inject = ['$scope', '$resource', '$mdBottomSheet', 'allPlayers', 'playTime'];
function BottomSheetController($scope, $resource, $mdBottomSheet, allPlayers, playTime) {
	$scope.bottomSheet = {};
	$scope.bottomSheet.players = allPlayers;

	for (var i = 0; i < allPlayers.length; i++) {
		var player = allPlayers[i];
		var history = player.getHistory();
		var numSections = history.length;
		var interval = playTime / numSections;
		for (var j = 0; j < numSections; j++) {
			var section = history[j];
			if (!section.timesPicked) {
				if (j > 0 && history[j-1].timesPicked) {
					section.startPercentage = history[j-1].endPercentage;
				} else {
					section.startPercentage = j / numSections;
				}

				if (j + 1 < numSections && history[j+1].timesPicked) {
					section.endPercentage = history[j+1].startPercentage;
				} else {
					section.endPercentage = (j+1) / numSections;
				}
				section.timesPicked = true;
			}
			section.startTime = section.startPercentage * playTime;
			section.endTime = section.endPercentage * playTime;
		}
	}

	$scope.save = function() {
		for (var i = 0; i < $scope.bottomSheet.players.length; i++) {
			var player = $scope.bottomSheet.players[i];
			var history = player.getHistory();
			for (var j = 0; j < history.length; j++) {
				var section = history[j];
				section.startPercentage = section.startTime / playTime;
				section.endPercentage = section.endTime / playTime;
				delete section.startTime;
				delete section.endTime;
			}
			player.setHistory(history);
		}
		$mdBottomSheet.hide($scope.bottomSheet.players);
	}
}