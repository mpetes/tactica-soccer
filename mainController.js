'use strict';

var soccerDraw = angular.module('soccerDraw', ['ngRoute', 'ngMaterial', 'ngResource'])

soccerDraw.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/login-register', {
                templateUrl: 'components/login-register/login-register.html',
                controller: 'LoginRegisterController'
            }).
            when('/Create', {
                templateUrl: 'components/create/create-template.html',
                controller: 'CreateController'
            }).
            when('/Playbook', {
                templateUrl: 'components/playbook/playbook-template.html',
                controller: 'PlaybookController'
            }).
            when('/Playbook/:playId', {
                templateUrl: 'components/playbook/saved-play-template.html',
                controller: 'SavedPlayController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);

soccerDraw.controller('MainController', ['$scope', '$rootScope', '$location', '$resource', 
    function ($scope, $rootScope, $location, $resource) {

        /* Variables used throughout the photo app. */
        $scope.main = {};
        $scope.main.loggedIn = true;


        /* When the route changes to anything other than login-register, 
        verify that the user is logged in. Otherwise, redirect the user to the
        login-register page. */
        $rootScope.$on("$routeChangeStart", function(event, next, current) {

            /* Check to see if a user is currently logged in. If one is, don't redirect to login-register page. */
            /*var sessionRes = $resource("/session");
            sessionRes.get({}, function(response) {
                if (response.loggedIn === true) {
                    $scope.main.loggedIn = true;
                    $scope.main.userID = response.userID;
                } else {
                    // no logged user, redirect to /login-register unless already there
                    if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                        $location.path("/login-register");
                    }
                }
            }, function errorHandling(err) {
                console.error('Couldnt determine logged-in status.');
            });*/
        });

        /*
        * FetchModel - Fetch a model from the web server.
        *   url - string - The URL to issue the GET request.
        *   doneCallback - function - called with argument (model) when the
        *                  the GET request is done. The argument model is the object
        *                  containing the model. model is undefined in the error case.
        */
        $scope.FetchModel = function(url, doneCallback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                 //Don’t do anything if not final state
                if (xhr.readyState !== 4){ 
                    return; 
                }
                //Final State but status not OK
                if (xhr.status !== 200) {
                    console.log("Error attempting to fetch model.");
                    return;
                }

                //If everything is okay, get the model and call doneCallback
                var text = xhr.responseText;
                var model = JSON.parse(text);
                doneCallback(model);
            };

            //Send the request
            xhr.open("GET", url);
            xhr.send();
        };

        /* Used by a user to logout. */
        /*$scope.logout = function() {
            var logoutRes = $resource("/admin/logout");
            logoutRes.get({}, function(response) {
                $scope.main.loggedIn = false;
                $scope.main.firstName = "";
                $rootScope.$broadcast("Logout");
                $location.path("/login-register"); 
                $scope.main.name = "";
                $scope.main.password = "";
                $scope.main.toolbarDisplay = "Welcome Page";
            }, function errorHandling(err) {
                console.error("Logout failed.");
            });
        }*/
    }]);


