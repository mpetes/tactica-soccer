'use strict';

soccerDraw.controller('PageListController', ['$scope', '$mdSidenav',
    function ($scope, $mdSidenav) {
        $scope.main.title = 'Users';
        $scope.main.pageList = ["Create", "Playbook"];
        $scope.closeSidenav = function() {
        	$mdSidenav('left').toggle();
        }
    }]);

