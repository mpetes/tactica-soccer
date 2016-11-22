soccerDraw.controller('PlayerPickerController', PlayerPickerController);

PlayerPickerController.$inject = ['$scope', '$resource', '$mdDialog', 'allPlayers'];
function PlayerPickerController($scope, $resource, $mdDialog, allPlayers) {
	$scope.playerPicker = {};
	$scope.playerPicker.newPlayers = [];
	$scope.attackColor = "#000000";
	$scope.defenseColor = "#000000";
	$scope.playerPicker.attackRgb = "";
	$scope.playerPicker.defenseRgb = "";
	$scope.playerPicker.attackPlayers = [];
	$scope.playerPicker.defensePlayers = [];
	$scope.playerPicker.currAttackNumber = 1;
	$scope.playerPicker.currDefenseNumber = 1;
	$scope.selectedAttackShape = "circle";
	$scope.selectedDefenseShape = "square";	

	for (var i = 0; i < allPlayers.length; i++) {
		if (allPlayers[i].isUserTeam()) {
			$scope.playerPicker.attackPlayers.push(allPlayers[i].number.toString());
		} else {
			$scope.playerPicker.defensePlayers.push(allPlayers[i].number.toString());
		}
	}

	$scope.$watch('attackColor', function() {
		var x = document.getElementsByClassName("attack selected");
		if (x.length !== 0) {
			var elem = x[0];
			if (elem.id === 'triangle') {
				elem.setAttribute('border-bottom', '28px solid ' + $scope.attackColor);
			} else {
				elem.style.background = $scope.attackColor;
			}
		} else {
			$scope.selectShape("square", "attack");
		}
		var r = hexToR($scope.attackColor);
		var g = hexToG($scope.attackColor);
		var b = hexToB($scope.attackColor);
	});

	$scope.$watch('defenseColor', function() {
		var x = document.getElementsByClassName("defense selected");
		if (x.length !== 0) {
			var elem = x[0];
			if (elem.id === 'triangle') {
				elem.style.borderBottom = '28px solid ' + $scope.defenseColor;
			} else {
				elem.style.background = $scope.defenseColor;
			}
		} else {
			$scope.selectShape("circle", "defense");
		}
		var r = hexToR($scope.defenseColor);
		var g = hexToG($scope.defenseColor);
		var b = hexToB($scope.defenseColor);
	});

	$scope.selectShape = function(shape, team) {
		var otherElems = document.getElementsByClassName(team);
		for (var i = 0; i < otherElems.length; i++) {
			var x = otherElems[i];
			$(x).removeClass('selected');
			if (x.id === 'triangle') {
				x.style.borderBottom = '28px solid #A9A9A9';
			} else {
				x.style.background = "#A9A9A9";
			}
		}
		var elem = document.getElementsByClassName(shape + " " + team)[0];
		$(elem).addClass('selected');
		console.log(elem);
		if (team === 'attack') {
			$scope.selectedAttackShape = shape;
			if (elem.id === 'triangle') {
				elem.style.borderBottom = '28px solid ' + $scope.attackColor;
			} else {
				elem.style.background = $scope.attackColor;
			}
		} else {
			$scope.selectedDefenseShape = shape;
			if (elem.id === 'triangle') {
				elem.style.borderBottom = '28px solid ' + $scope.defenseColor;
			} else {
				elem.style.background = $scope.defenseColor;
			}
		}
	}

    $scope.cancel = function() {
    	$mdDialog.cancel();
    };

    $scope.save = function(answer) {
    	$mdDialog.hide(JSON.stringify($scope.playerPicker.newPlayers));
    };

    $scope.addAttackingPlayer = function() {
    	if ($scope.playerPicker.currAttackNumber <= 11) {
	    	$scope.playerPicker.attackPlayers.push($scope.playerPicker.currAttackNumber);
	    	$scope.playerPicker.currAttackNumber++;
	    }
    };

    $scope.addDefensivePlayer = function() {
    	if ($scope.playerPicker.currDefenseNumber <= 11) {
	    	$scope.playerPicker.defensePlayers.push($scope.playerPicker.currDefenseNumber);
	    	$scope.playerPicker.currDefenseNumber++;
	    }
    }

	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
};
