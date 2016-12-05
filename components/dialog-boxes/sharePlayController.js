soccerDraw.controller('SharePlayController', SharePlayController);

SharePlayController.$inject = ['$scope', '$mdDialog'];
function SharePlayController($scope,  $mdDialog) {
	$scope.sharePlay = {};
	$scope.sharePlay.accessLevel = 0;
	$scope.sharePlay.email = "";

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		if ($scope.sharePlay.accessLevel === true) {
			$scope.sharePlay.accessLevel = 1;
		} else {
			$scope.sharePlay.accessLevel = 0;
		}
		$mdDialog.hide(JSON.stringify($scope.sharePlay));
	}
}