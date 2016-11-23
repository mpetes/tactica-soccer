soccerDraw.controller('BottomSheetController', BottomSheetController);

BottomSheetController.$inject = ['$scope', '$resource', '$mdBottomSheet', 'allPlayers'];
function BottomSheetController($scope, $resource, $mdBottomSheet, allPlayers) {
	$scope.bottomSheet = {};
	$scope.bottomSheet.players = allPlayers;
}