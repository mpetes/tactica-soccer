'use strict';

soccerDraw.controller('SavedPlayController', ['$scope', '$http', '$resource', '$location', '$rootScope', '$routeParams',
  function ($scope, $http, $resource, $location, $rootScope, $routeParams) {
  	$scope.savedPlay = {};
  	$scope.savedPlay.id = $routeParams.playId;


}]);


