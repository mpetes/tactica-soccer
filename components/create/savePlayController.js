soccerDraw.controller('SavePlayController', SavePlayController);

SavePlayController.$inject = ['$scope', '$mdDialog'];
function SavePlayController($scope,  $mdDialog) {
	$scope.savePlay = {};
	$scope.savePlay.name = "";

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		$mdDialog.hide(JSON.stringify($scope.savePlay));
	}
}