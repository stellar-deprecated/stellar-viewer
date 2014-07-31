stellarExplorer.controller('appController', function($scope, $q, requestHelper, federation, reverseFederation) {
  var websocketProtocol = location.protocol == 'https:' ? 'wss:' : 'ws:';

  $scope.testConfig = {
    network: websocketProtocol + '//test.stellar.org:9001',
    txt: 'stellar-stg.stellar.org',
    domain: 'stg.stellar.org',
    rootAddress: 'ganVp9o5emfzpwrG5QVUXqMv8AgLcdvySb'
  };

  $scope.liveConfig = {
    network: websocketProtocol + '//live.stellar.org:9001',
    txt: 'stellar.stellar.org',
    domain: 'stellar.org',
    rootAddress: 'ganVp9o5emfzpwrG5QVUXqMv8AgLcdvySb'
  };

  var connection = null;

  $scope.reset = function() {
    $scope.config = $scope.testConfig;

    updateQueryFromHash(true);

    $scope.queryValid = true;
    $scope.lastQuery = '';
    $scope.address = '';

    $scope.account_info = null;
    $scope.account_lines = [];
    $scope.account_offers = [];

    $scope.balances = {};
    $scope.balanceCurrencies = [];

    connect(true);
  }

  function updateQueryFromHash(initialUpdate) {
    if (location.hash.substr(2) == $scope.query) {
      return;
    }

    if (location.hash == '#/') {
      $scope.query = $scope.config.rootAddress;
    } else if (location.hash.substr(0,2) == '#/') {
      $scope.query = location.hash.substr(2);
    } else if (initialUpdate == true) {
      $scope.query = $scope.config.rootAddress;
    } else {
      $scope.query = '';
    }

    if (initialUpdate !== true) {
      $scope.updateAccountData();
    }
  }

  $scope.useTestConfig = function() {
    if ($scope.config == $scope.testConfig) return;
    $scope.config = $scope.testConfig;
    connection.close();
  };

  $scope.useLiveConfig = function() {
    if ($scope.config == $scope.liveConfig) return;
    $scope.config = $scope.liveConfig;
    connection.close();
  };

  function connect(initialUpdate) {
    $scope.loading = true;

    connection = new WebSocket($scope.config.network);

    connection.onopen = function() {
      requestHelper.useConnection(connection);

      $scope.$apply(function() {
        $scope.updateAccountData(true, initialUpdate);
      });
    };

    connection.onclose = function() {
      $scope.$apply(connect);
    };
  }

  requestHelper.setDefaultCallback(function() {
    $scope.requestAccountData(true);
  });

  $scope.queryAddress = function(address) {
    $scope.query = address || $scope.config.rootAddress;
    $scope.updateAccountData();
  };

  $scope.updateAccountData = function(silent, initialUpdate) {
    if (!silent) {
      $scope.loading = true;

      // HACK: Reset these references to prevent highlighing values when rendering a new account.
      $scope.account_info = null;
      $scope.account_lines = [];
      $scope.account_offers = [];
      $scope.balances = {};
      $scope.balanceCurrencies = [];
    }

    if (!initialUpdate) {
      location.hash = '#/' + $scope.query;
    }
    
    requestHelper.unsubscribeTransactions($scope.address);

    resolveQuery().then(function() { $scope.requestAccountData(silent); });

    requestHelper.subscribeTransactions($scope.address);
  }

  $scope.requestAccountData = function() {
    requestHelper.getAccountInfo($scope.address, function(info) {
      $scope.account_info = info;
    })
      .then(function() {
        return requestHelper.getAccountLines($scope.address, function(lines) {
          $scope.account_lines = lines;
        });
      })
      .then(function() {
        return requestHelper.getAccountOffers($scope.address, function(offers) {
          $scope.account_offers = offers;
        });
      })
      .then(aggregateBalances)
      .finally(function() {
        $scope.loading = false;
        $scope.apply();
      });
  };

  function resolveQuery() {
    var deferred = $q.defer();

    $scope.lastQuery = $scope.query;
    $scope.queryValid = true;

    var validAddress = false;

    try {
      validAddress = !!base58.base58Check.decode($scope.query);
    } catch (e) {}

    if (validAddress) {
      $scope.address = $scope.query;

      reverseFederation.check_address($scope.address, $scope.config.txt, $scope.config.domain)
        .then(function (result) {
          $scope.lastQuery = result.destination + '@' + result.domain;
          deferred.resolve();
        },
        function () {
          deferred.resolve();
        });
    } else {
      federation.check_email($scope.query, $scope.config.txt, $scope.config.domain)
        .then(function (result) {
          $scope.lastQuery = result.destination + '@' + result.domain;
          $scope.address = result.destination_address;
          deferred.resolve();
        },
        function () {
          $scope.queryValid = false;
          $scope.address = '';
          deferred.reject();
        });
    }

    return deferred.promise;
  }

  function aggregateBalances() {
    $scope.balances = {'STR': 0};
    $scope.balanceCurrencies = ['STR'];

    if (!$scope.account_info) return;

    $scope.balances['STR'] = +dustToStellars($scope.account_info.Balance);

    $scope.account_lines.forEach(function(line) {
      $scope.balances[line.currency] = ($scope.balances[line.currency] || 0) + (+line.balance);
    });

    $scope.balanceCurrencies = Object.getOwnPropertyNames($scope.balances);
  }

  $scope.reset();

  window.addEventListener("hashchange", function() {
    updateQueryFromHash();
  }, false);
});