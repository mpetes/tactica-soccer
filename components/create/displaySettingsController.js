soccerDraw.controller('DisplaySettingsController', DisplaySettingsController);

DisplaySettingsController.$inject = ['$scope', '$mdDialog', 'isRecording', 'isAdvanced', 'isTrail', 'isBall', 'isWhiteBackground', 'isFullField'];
function DisplaySettingsController($scope,  $mdDialog, isRecording, isAdvanced, isTrail, isBall, isWhiteBackground, isFullField) {
	$scope.displaySettings = {};
	$scope.displaySettings.trail = isTrail;
	$scope.displaySettings.recording = isRecording;
	$scope.displaySettings.ball = isBall;
	$scope.displaySettings.advanced = isAdvanced;
	$scope.displaySettings.whiteBackground = isWhiteBackground;
	$scope.displaySettings.fullField = isFullField;

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		$mdDialog.hide(JSON.stringify($scope.displaySettings));
	}
}