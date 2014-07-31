stellarExplorer.service('requestHelper', function($q, callbackHelper) {
  var connection = null;

  function useConnection(newConnection) {
    connection = newConnection;

    connection.onmessage = function(message) {
      var response = JSON.parse(message.data);
      
      var callback = callbackHelper.getCallback(response.id);
      delete response.id;

      callback(response);
    };
  }

  function useAddress(address) {
    connection = newConnection;

    connection.onmessage = function(message) {
      var response = JSON.parse(message.data);
      
      var callback = callbackHelper.getCallback(response.id);
      delete response.id;

      callback(response);
    };
  }

  function account_request(address, command, callback) {
    var request = {
      command: command,
      account: address
    };

    return generic_request(request, callback);
  }

  function generic_request(request, callback) {
    var deferred = $q.defer();

    callbackHelper.registerCallback(request, callback, deferred);

    connection.send(JSON.stringify(request));

    return deferred.promise;
  }

  function subscribeTransactions(address) {
    var request = {
      command: 'subscribe',
      accounts: [address],
      streams: ['transactions']
    };

    return generic_request(request);
  }

  function unsubscribeTransactions(address) {
    var request = {
      command: 'unsubscribe',
      accounts: [address],
      streams: ['transactions']
    };

    return generic_request(request);
  }

  function getAccountInfo(address, callback) {
    return account_request(address, 'account_info', function(response) {
      if (response.status == 'success') callback(response.result.account_data);
      else callback(null);
    });
  }

  function getAccountLines(address, callback) {
    return account_request(address, 'account_lines', function(response) {
      if (response.status == 'success') callback(response.result.lines);
      else callback([]);
    });
  }

  function getAccountOffers(address, callback) {
    return account_request(address, 'account_offers', function(response) {
      if (response.status == 'success') callback(response.result.offers);
      else callback([]);
    });
  }

  return {
    useConnection: useConnection,
    getAccountInfo: getAccountInfo,
    getAccountLines: getAccountLines,
    getAccountOffers: getAccountOffers,
    subscribeTransactions: subscribeTransactions,
    unsubscribeTransactions: unsubscribeTransactions,
    setDefaultCallback: callbackHelper.setDefaultCallback
  };
});