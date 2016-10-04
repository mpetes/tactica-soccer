'use strict';

soccerDraw.controller('PageListController', ['$scope',
    function ($scope) {
        $scope.main.title = 'Users';
        $scope.main.pageList = ["Create", "Playbook", "My Account"];
    }]);

