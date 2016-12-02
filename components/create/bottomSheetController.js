soccerDraw.controller('BottomSheetController', BottomSheetController);

BottomSheetController.$inject = ['$scope', '$resource', '$mdBottomSheet', 'allPlayers', 'playTime', 'gameBall'];
function BottomSheetController($scope, $resource, $mdBottomSheet, allPlayers, playTime, gameBall) {
	$scope.bottomSheet = {};
	$scope.bottomSheet.close = true;
	$scope.bottomSheet.players = allPlayers.slice();
	gameBall.currentNumber = "Ball"; 
	$scope.bottomSheet.ball = gameBall;
	if (gameBall.history.length !== 0) $scope.bottomSheet.players.push(gameBall);

	for (var i = 0; i < allPlayers.length; i++) {
		var player = allPlayers[i];
		setStartAndEndTime(player);
	}

	$scope.save = function() {
		for (var i = 0; i < $scope.bottomSheet.players.length; i++) {
			var player = $scope.bottomSheet.players[i];
			for (var j = 0; j < player.history.length; j++) {
				var section = player.history[j];
				section.timesPicked = true;
			}
			updateHistory(player);
		}
		if (gameBall.history.length !== 0) $scope.bottomSheet.ball = $scope.bottomSheet.players.pop();
		delete $scope.bottomSheet.ball.currentNumber;
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
					section.endPercentage = section.startPercentage;
					section.timesPicked = true;
				} else {
					section.startPercentage = j / numSections;
					section.endPercentage = (j+1) / numSections;
				}
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