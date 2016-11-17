soccerDraw.controller('PlayerPickerController', ['$scope', '$http', '$resource', '$location', '$rootScope', '$mdDialog',
  function ($scope, $http, $resource, $location, $rootScope, $mdDialog) {
        $scope.cancel = function() {
        	$mdDialog.cancel();
        };

        $scope.hide = function() {
         	$mdDialog.hide();
        };

        $scope.answer = function(answer) {
        	$mdDialog.hide(answer);
        }
}]);
