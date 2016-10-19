'use strict';

soccerDraw.controller('LoginRegisterController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {
    $scope.messageReport = "";
    $scope.messageToShow = false;

  	$scope.attemptLogin = function() {
      /* Ensure the password and login name fields are not blank. */
      if ($scope.main.username === "" || $scope.main.password === "") {
        $scope.messageReport = "Error: Please fill out both your username and password to log in.";
        $scope.messageToShow = true;
        return;
      }

  		var loginRes = $resource("/login");
  		loginRes.save({username: $scope.main.username, password: $scope.main.password}, function(response) {
        $scope.messageToShow = false;
    		$scope.main.loggedIn = true;
   			$scope.main.name = response.name;
        $scope.main.email = response.email;
   			$rootScope.$broadcast("Login");
 			  $location.path("#/Create/"); 
  		}, function errorHandling(err) {
        $scope.messageReport = "Error: Username or password incorrect.";
  			$scope.messageToShow = true;
  		});
  	} 
  }]);