soccerDraw.controller('DisplaySettingsController', DisplaySettingsController);

DisplaySettingsController.$inject = ['$scope', '$mdDialog', 'isAdvanced', 'isTrail', 'isBall', 'isWhiteBackground', 'isFullField', 'isAtHistoryStart'];
function DisplaySettingsController($scope,  $mdDialog, isAdvanced, isTrail, isBall, isWhiteBackground, isFullField, isAtHistoryStart) {
	$scope.displaySettings = {};
	$scope.displaySettings.trail = isTrail;
	$scope.displaySettings.ball = isBall;
	$scope.displaySettings.advanced = isAdvanced;
	$scope.displaySettings.whiteBackground = isWhiteBackground;
	$scope.displaySettings.fullField = isFullField;
	$scope.displaySettings.atHistoryStart = isAtHistoryStart;

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		if ($scope.displaySettings.trail === false) $scope.displaySettings.atHistoryStart = false;
		$mdDialog.hide(JSON.stringify($scope.displaySettings));
	}
}