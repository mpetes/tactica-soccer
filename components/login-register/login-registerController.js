'use strict';

soccerDraw.controller('LoginRegisterController', ['$scope', '$http', '$resource', '$location', '$rootScope', 
	function ($scope, $http, $resource, $location, $rootScope) {
	    $scope.messageReport = "";
	    var windowHeight = $(window).height();
	    document.getElementById('ng-view').style = "min-height: " + windowHeight + "px";

	    $scope.newUser = {};
	    $scope.newUser.password1 = "";
	    $scope.newUser.password2 = "";
	    $scope.newUser.email = "";
	    $scope.newUser.name = "";

	  	$scope.attemptLogin = function() {
			/* Ensure the password and login name fields are not blank. */
			if ($scope.main.email === "" || $scope.main.password === "") {
				sendFeedback("Please fill out both your email and password to log in.", true);
				return;
			}

	  		var loginRes = $resource("/login");
	  		loginRes.save({email: $scope.main.email, password: $scope.main.password}, function(response) {
	    		$scope.main.loggedIn = true;
	   			$scope.main.name = response.name;
	        	$scope.main.email = response.email;
	   			$rootScope.$broadcast("Login");
	 			$location.path("#/Create/"); 
	  		}, function errorHandling(err) {
	        	sendFeedback("Username or password incorrect.", true);
	  		});
	  	};

	    $scope.attemptRegister = function() {
			if (badRegisterFields()) return;

			var registerRes = $resource("/register");
			registerRes.save({password: $scope.newUser.password1, email: $scope.newUser.email, name: $scope.newUser.name}, function (response) {
				sendFeedback("New user registered. Please login.", false);
				$scope.main.loggedIn = false;
				$scope.newUser.email = "";
				$scope.newUser.password1 = "";
				$scope.newUser.password2 = "";
				$scope.newUser.name = "";
			}, function errorHandling(err) {
				sendFeedback("Unable to register new user.", true);
			});
	    };

	    function badRegisterFields() {
			if ($scope.newUser.password1 !== $scope.newUser.password2) {
				sendFeedback("Password fields must match.", true);
				return true;
			}
			if ($scope.newUser.password1.length < 6 || $scope.newUser.password2.length < 6) {
				sendFeedback("Password must be at least 6 characters.", true);
				return true;
			}
			if ($scope.newUser.email.indexOf("stanford.edu") === -1) {
				sendFeedback("Email not valid for registration.", true);
				return true;
			}
			if ($scope.newUser.name.length < 2) {
				sendFeedback("Please enter your full name.", true);
				return true;
			}
			return false;
	    }

	    function sendFeedback(message, error) {
			var responseDiv = document.getElementById("login-response");
			if (error) {
				responseDiv.style.color = "red";
				$scope.messageReport = "Error: " + message;
			} else {
				responseDiv.style.color = "green";
				$scope.messageReport = "Success: " + message;
			}
			responseDiv.style.visibility = "visible";
			setTimeout(function() {
				responseDiv.style.visibility = "hidden";
			}, 4000);
	    }

	    document.body.addEventListener('keydown', function(e) {
	        if (e.keyCode === 13) {
	            $scope.attemptLogin();
	        }
	    });
	}
]);