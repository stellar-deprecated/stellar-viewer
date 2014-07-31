stellarExplorer.directive('balance', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: './templates/balance.html',
    controller: function($scope) {
      $scope.balanceClass = function(value) {
        var classes = [];
        
        if (toFinancial(value).length > 11) classes.push('balance-large');
        if ((+value) < 0) classes.push('negative');

        return classes.join(' ');
      };
    }
  };
});