soccerDraw.controller('DisplaySettingsController', DisplaySettingsController);

DisplaySettingsController.$inject = ['$scope', '$mdDialog', 'isRecording', 'isAdvanced', 'isTrail', 'isBall'];
function DisplaySettingsController($scope,  $mdDialog, isRecording, isAdvanced, isTrail, isBall) {
	$scope.displaySettings = {};
	$scope.displaySettings.trail = isTrail;
	$scope.displaySettings.recording = isRecording;
	$scope.displaySettings.ball = isBall;
	$scope.displaySettings.advanced = isAdvanced;

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		$mdDialog.hide(JSON.stringify($scope.displaySettings));
	}
}