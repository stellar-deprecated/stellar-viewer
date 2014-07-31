stellarExplorer.directive('offers', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: './templates/offers.html',
    controller: function($scope) {
      $scope.sellValue = function(offer) {
        var value = offer.taker_gets.value || dustToStellars(offer.taker_gets);

        return toFinancial(value);
      };

      $scope.sellCurrency= function(offer) {
        return offer.taker_gets.currency || 'STR';
      };

      $scope.buyCurrency = function(offer) {
        return offer.taker_pays.currency || 'STR';
      };

      $scope.price = function(offer) {
        var sellAmount = offer.taker_gets.value || dustToStellars(offer.taker_gets);
        var buyAmount = offer.taker_pays.value || dustToStellars(offer.taker_pays);

        var sellCurrency = offer.taker_gets.currency || 'STR';
        var buyCurrency = offer.taker_pays.currency || 'STR';

        return toFinancial(buyAmount / sellAmount) + ' ' + (buyCurrency + ' / ' + sellCurrency);
      };
    }
  };
});