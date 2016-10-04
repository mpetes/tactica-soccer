'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$http', '$resource', '$location', '$rootScope',
  function ($scope, $http, $resource, $location, $rootScope) {

    /* The fields used to register a new user. */
    $scope.newUser = {}
    $scope.newUser.password1 = "";
    $scope.newUser.password2 = "";
    $scope.newUser.first_name = "";
    $scope.newUser.last_name = "";
    $scope.newUser.location = "";
    $scope.newUser.occupation = "";
    $scope.newUser.description = "";
    $scope.newUser.login_name = "";

    /* Used to relay error messages regarding logging in or registering. */
    $scope.messageReport = "";
    $scope.messageToShow = false;

    /* Attempts to login a user with the login name and password currently listed
    in the fields for login and password as specified in login-register.html. */
  	$scope.attemptLogin = function() {
      /* Ensure the password and login name fields are not blank. */
      if ($scope.main.name === "" || $scope.main.password === "" || $scope.main.name === undefined || $scope.main.password === undefined) {
        /* Display error message. */
        $scope.messageToShow = "Error: Please fill out both the login name and password to log in.";
        $scope.messageToShow = true;
        return;
      }

      /* Make a post request to webServer.js for the /admin/login route. Verifies that a user with
      the specified login name and password exists, and if one does, the view is redirected to that user's
      detail page. Otherwise, an error is reported.*/
  		var loginRes = $resource("/admin/login");
  		loginRes.save({login_name: $scope.main.name, password: $scope.main.password}, function(response) {
        $scope.messageToShow = false;
    		$scope.main.loggedIn = true;
   			$scope.main.firstName = response.first_name;
        $scope.main.userID = response.id;
   			$rootScope.$broadcast("Login");
 			  $location.path("/users/" + response.id); 
  		}, function errorHandling(err) {
        /* Display error message. */
        $scope.messageReport = "Error: Login name or password incorrect.";
  			$scope.messageToShow = true;
  		});
  	}

    /* Attempts to register a new user. */
    $scope.register = function() {

      /* Verify the two password fields match. */
      if ($scope.newUser.password1 !== $scope.newUser.password2) {
        /* Display error message. */
        $scope.messageReport = "Error: Both password fields must be the same to register.";
        $scope.messageToShow = true;

        /* Reset touched fields so that required messages won't show. */
        $scope.loginForm.loginName.$touched = false;
        $scope.loginForm.loginPassword.$touched = false;
        return;
      }

      /* Verify all required fields are entered. */
      if ($scope.newUser.login_name === "" || $scope.newUser.first_name === "" || $scope.newUser.last_name === "" || $scope.newUser.password1 === "" || $scope.newUser.login_name === undefined || $scope.newUser.first_name === undefined || $scope.newUser.last_name === undefined || $scope.newUser.password1 === undefined) {
        /* Display error message. */
        $scope.messageReport = "Error: Please fill out all required fields (login, passwords, first and last names) to register.";
        $scope.messageToShow = true;

        /* Reset touched fields so that required messages won't show. */
        $scope.loginForm.loginName.$touched = false;
        $scope.loginForm.loginPassword.$touched = false;
        return;
      }

      /* Make a post request to webServer.js at the /user route. Attempts to create a new user with the
      information entered in the form in login-register.html. If successful, erases the filled-in fields
      and reports "success" to the user. Otherwise, it reports failure. */
      var registerRes = $resource("/user");
      registerRes.save({password: $scope.newUser.password1, first_name: $scope.newUser.first_name, last_name: $scope.newUser.last_name, location: $scope.newUser.location, occupation: $scope.newUser.occupation, description: $scope.newUser.description, login_name: $scope.newUser.login_name}, function(response) {
        $scope.messageReport = "Success registering!";
        $scope.messageToShow = true;
        $scope.newUser = {};

        /* Reset touched fields so that required messages won't show. */
        $scope.loginForm.loginName.$touched = false;
        $scope.loginForm.loginPassword.$touched = false;
        $scope.registerForm.newLoginName.$touched = false;
        $scope.registerForm.newPassword1.$touched = false;
        $scope.registerForm.newPassword2.$touched = false;
        $scope.registerForm.newFirstName.$touched = false;
        $scope.registerForm.newLastName.$touched = false;
      }, function errorHandling(err) {
        $scope.messageReport = "Error: Unable to register new user.";
        $scope.messageToShow = true;
      }); 
    }
    
  }]);