'use strict';

var soccerDraw = angular.module('soccerDraw', ['ngRoute', 'ngMaterial', 'ngResource', 'angular-p5']);

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
            when('/Playbook/:playId/:owned', {
                templateUrl: 'components/create/create-template.html',
                controller: 'CreateController'
            }).
            otherwise({
                redirectTo: '/Create'
            });
    }]);

soccerDraw.controller('MainController', ['$scope', '$rootScope', '$location', '$resource', '$mdSidenav', 
    function ($scope, $rootScope, $location, $resource, $mdSidenav) {

        /* Variables used throughout the photo app. */
        $scope.main = {};
        $scope.main.loggedIn = false;
        $scope.main.name = "";
        $scope.main.email = "";
        $scope.main.password = "";

        /* When the route changes to anything other than login-register, 
        verify that the user is logged in. Otherwise, redirect the user to the
        login-register page. */
        $rootScope.$on("$routeChangeStart", function(event, next, current) {

            /* Check to see if a user is currently logged in. If one is, don't redirect to login-register page. */
            var sessionRes = $resource("/session");
            sessionRes.get({}, function(response) {
                if (response.loggedIn === true) {
                    $scope.main.loggedIn = true;
                    $scope.main.name = response.name;
                    $scope.main.email = response.email;
                } else {
                    // no logged user, redirect to /login-register unless already there
                    if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                        $location.path("/login-register");
                    }
                }
            }, function errorHandling(err) {
                console.error('Couldnt determine logged-in status.');
            });
        });

        $scope.navigateTo = function(page) {
            $location.path("/" + page);
        }

        /* Used by a user to logout. */
        $scope.logout = function() {
            var logoutRes = $resource("/logout");
            logoutRes.get({}, function(response) {
                $scope.main.loggedIn = false;
                $scope.main.name = "";
                $scope.main.email = "";
                $scope.main.password = "";
                $rootScope.$broadcast("Logout");
                $location.path("/login-register"); 
            }, function errorHandling(err) {
                console.error("Logout failed.");
            });
        }

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                  fn();
                }
            } else {
                this.$apply(fn);
            }
        };

    }]);


