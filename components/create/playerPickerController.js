soccerDraw.controller('PlayerPickerController', PlayerPickerController);

PlayerPickerController.$inject = ['$scope', '$resource', '$mdDialog', 'allPlayers'];
function PlayerPickerController($scope, $resource, $mdDialog, allPlayers) {
	$scope.playerPicker = {};
	$scope.attackColor = "#000000";
	$scope.defenseColor = "#000000";
	$scope.playerPicker.attackPlayers = [];
	$scope.playerPicker.defensePlayers = [];
	$scope.playerPicker.currAttackNumber = 1;
	$scope.playerPicker.currDefenseNumber = 1;
	$scope.selectedAttackShape = "circle";
	$scope.selectedDefenseShape = "square";

	for (var i = 0; i < allPlayers.length; i++) {
		var info = {team: allPlayers[i].attackTeam, startingNumber: allPlayers[i].startingNumber, currentNumber: allPlayers[i].currentNumber, new: false, color: allPlayers[i].color, shape: allPlayers[i].shape};
		if (allPlayers[i].attackTeam) {
			$scope.playerPicker.attackPlayers.push(info);
			$scope.selectedAttackShape = info.shape;
			parseRGB($scope, "attackColor", info);
			if (info.currentNumber >= $scope.playerPicker.currAttackNumber) {
				$scope.playerPicker.currAttackNumber = info.currentNumber + 1;
			}
		} else {
			$scope.playerPicker.defensePlayers.push(info);
			$scope.selectedDefenseShape = info.shape;
			parseRGB($scope, "defenseColor", info);
			$scope.defenseColor = "#" + info.color.red.toString(16) + info.color.green.toString(16) + info.color.blue.toString(16);
			if (info.currentNumber >= $scope.playerPicker.currDefenseNumber) {
				$scope.playerPicker.currDefenseNumber = info.currentNumber + 1;
			}
		}
	}

	function parseRGB(colorDict, key, info) {
		var r = info.color.red.toString(16);
		if (r.length === 1) r = "0" + r;
		var g = info.color.green.toString(16);
		if (g.length === 1) g = "0" + g;
		var b = info.color.blue.toString(16);
		if (b.length === 1) b = "0" + b;
		colorDict[key] = "#" + r + g + b;
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
			$scope.selectShape($scope.selectedAttackShape, "attack");
		}
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
			$scope.selectShape($scope.selectedDefenseShape, "defense");
		}
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
    	var players = [];
    	for (var i = 0; i < $scope.playerPicker.attackPlayers.length; i++) {
    		var player = $scope.playerPicker.attackPlayers[i];
    		player.color = {red: hexToR($scope.attackColor), green: hexToG($scope.attackColor), blue: hexToB($scope.attackColor)};
    		player.shape = $scope.selectedAttackShape;
    		players.push(player);
    	}
    	for (var i = 0; i < $scope.playerPicker.defensePlayers.length; i++) {
    		var player = $scope.playerPicker.defensePlayers[i];
    		player.color = {red: hexToR($scope.defenseColor), green: hexToG($scope.defenseColor), blue: hexToB($scope.defenseColor)};
    		player.shape = $scope.selectedDefenseShape;
    		players.push(player);
    	}
    	$mdDialog.hide(JSON.stringify(players));
    };

    $scope.addAttackingPlayer = function() {
    	if ($scope.playerPicker.currAttackNumber <= 11) {
    		var newPlayer = {team: true, startingNumber: parseInt($scope.playerPicker.currAttackNumber), currentNumber: parseInt($scope.playerPicker.currAttackNumber), new: true};
	    	$scope.playerPicker.attackPlayers.push(newPlayer);
	    	$scope.playerPicker.currAttackNumber++;
	    }
    };

    $scope.addDefensivePlayer = function() {
    	if ($scope.playerPicker.currDefenseNumber <= 11) {
    		var newPlayer = {team: false, startingNumber: parseInt($scope.playerPicker.currDefenseNumber), currentNumber: parseInt($scope.playerPicker.currDefenseNumber), new: true};
	    	$scope.playerPicker.defensePlayers.push(newPlayer);
	    	$scope.playerPicker.currDefenseNumber++;
	    }
    }

	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
};
