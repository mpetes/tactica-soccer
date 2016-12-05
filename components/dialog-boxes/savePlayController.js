soccerDraw.controller('SavePlayController', SavePlayController);

SavePlayController.$inject = ['$scope', '$mdDialog', 'name'];
function SavePlayController($scope,  $mdDialog, name) {
	$scope.savePlay = {};
	$scope.savePlay.name = name;

	$scope.cancel = function() {
		$mdDialog.cancel();
	}

	$scope.save = function() {
		$mdDialog.hide(JSON.stringify($scope.savePlay));
	}
}