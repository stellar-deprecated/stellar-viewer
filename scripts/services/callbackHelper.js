stellarExplorer.service('callbackHelper', function() {
  var callbackId = 1;
  var callbacks = {};
  var defaultCallback = function() {};

  function registerCallback(request, callback, promise) {
    if (!callback) return;
    request.id = callbackId++;
    callbacks[request.id] = function() {
      callback.apply(null, arguments);
      if (promise) promise.resolve();
    }
  }

  function getCallback(id) {
    var callback = callbacks[id];
    delete callbacks[id];
    return callback || defaultCallback;
  }

  function setDefaultCallback(callback) {
    defaultCallback = callback;
  }

  return {
    registerCallback: registerCallback,
    getCallback: getCallback,
    setDefaultCallback: setDefaultCallback
  }
});