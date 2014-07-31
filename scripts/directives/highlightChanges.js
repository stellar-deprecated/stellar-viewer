stellarExplorer.directive('highlightChanges', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.$watch(attrs.highlightChanges, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          element.addClass('fresh');
          $timeout(function () { element.removeClass('fresh'); }, 1000);
        }
      });
    }
  };
});