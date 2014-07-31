stellarExplorer.directive('trustLines', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: './templates/trust-lines.html',
    controller: function($scope) {
      $scope.balanceClass = function(value) {
        var classes = [];
        
        if ((+value) < 0) classes.push('negative');

        return classes.join(' ');
      };
    }
  };
});