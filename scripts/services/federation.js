stellarExplorer.factory('federation', ['$q', '$rootScope', '$http', 'stellarTxt', function ($q, $scope, $http, $txt) {
  var txts = {};

  var cache = {};

  function check_email(email, txtAddress, defaultDomain) {
    if (email.indexOf('@') == -1) {
      email = email + '@' + defaultDomain;
    }

    var federationPromise = $q.defer();

    var tmp = email.split('@');
    var domain = tmp.pop();
    var user = tmp.join('@');

    if (cache[domain] && cache[domain][user]) {
      federationPromise.resolve(cache[domain][user]);
      return federationPromise.promise;
    }

    var txtPromise = $txt.get(txtAddress);

    if (txtPromise) {
      if ("function" === typeof txtPromise.then) {
        txtPromise.then(processTxt, handleNoTxt);
      } else {
        processTxt(txtPromise);
      }
    } else {
      handleNoTxt();
    }

    return federationPromise.promise;

    function handleNoTxt() {
      federationPromise.reject({
        result: "error",
        error: "noStellarTxt",
        error_message: "Stellar.txt not available for the requested domain."
      });
    }

    function processTxt(txt) {
      if (!txt.federation_url) {
        federationPromise.reject({
          result: "error",
          error: "noFederation",
          error_message: "Federation is not available on the requested domain."
        });
        return;
      }
      var config = {
        params: {
          type: 'federation',
          domain: domain,
          destination: user,
          // DEPRECATED "destination" is a more neutral name for this field
          //   than "user"
          user: user
        }
      }
      $http.get(txt.federation_url[0], config)
      .success(function (data) {
        if ("object" === typeof data &&
          "object" === typeof data.federation_json &&
          data.federation_json.type === "federation_record" &&
          (data.federation_json.user === user ||
            data.federation_json.destination === user) &&
          data.federation_json.domain === domain) {
          cache[domain] = cache[domain] || {};
          cache[domain][data.federation_json.destination] = federationPromise.promise;
          federationPromise.resolve(data.federation_json);
        } else if ("string" === typeof data.error) {
          federationPromise.reject({
            result: "error",
            error: "remote",
            error_remote: data.error,
            error_message: data.error_message
              ? "Service error: " + data.error_message
              : "Unknown remote service error."
          });
        } else {
          federationPromise.reject({
            result: "error",
            error: "unavailable",
            error_message: "Federation gateway's response was invalid."
          });
        }
      })
      .error(function () {
        federationPromise.reject({
          result: "error",
          error: "unavailable",
          error_message: "Federation gateway did not respond."
        });
      });
    }
  }

  return {
    check_email: check_email
  };
}]);