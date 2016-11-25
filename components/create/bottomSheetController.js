soccerDraw.controller('BottomSheetController', BottomSheetController);

BottomSheetController.$inject = ['$scope', '$resource', '$mdBottomSheet', 'allPlayers'];
function BottomSheetController($scope, $resource, $mdBottomSheet, allPlayers) {
	$scope.bottomSheet = {};
	$scope.bottomSheet.players = allPlayers;

	$scope.save = function() {
		$mdBottomSheet.hide($scope.bottomSheet.players);
	}
}