soccerDraw.controller('BottomSheetController', BottomSheetController);

BottomSheetController.$inject = ['$scope', '$resource', '$mdBottomSheet', 'allPlayers', 'playTime', 'gameBall'];
function BottomSheetController($scope, $resource, $mdBottomSheet, allPlayers, playTime, gameBall) {
	$scope.bottomSheet = {};
	$scope.bottomSheet.players = allPlayers;
	$scope.bottomSheet.ball = gameBall;

	for (var i = 0; i < allPlayers.length; i++) {
		var player = allPlayers[i];
		setStartAndEndTime(player);
	}
	setStartAndEndTime($scope.bottomSheet.ball);

	$scope.save = function() {
		for (var i = 0; i < $scope.bottomSheet.players.length; i++) {
			var player = $scope.bottomSheet.players[i];
			updateHistory(player);
		}
		updateHistory($scope.bottomSheet.ball);
		$mdBottomSheet.hide({players: $scope.bottomSheet.players, ball: $scope.bottomSheet.ball});
	}

	function setStartAndEndTime(player) {
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
			section.startTime = parseFloat(section.startTime.toFixed(4));
			section.endTime = section.endPercentage * playTime;
			section.endTime = parseFloat(section.endTime.toFixed(4));
		}
	}

	function updateHistory(player) {
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
}