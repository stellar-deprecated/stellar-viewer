stellarExplorer.factory('reverseFederation', ['$q', '$rootScope', '$http', 'stellarTxt', function ($q, $scope, $http, $txt) {
    var txts = {};

    var cache = {};

    function check_address(address, defaultDomain) {
        var reverseFederationPromise = $q.defer();

        var domain = defaultDomain;

        if (cache[domain] && cache[domain][address]) {
          reverseFederationPromise.resolve(cache[domain][address]);
          return reverseFederationPromise.promise;
        }

        var txtPromise = $txt.get(domain);

        if (txtPromise) {
            if ("function" === typeof txtPromise.then) {
                txtPromise.then(processTxt, handleNoTxt);
            } else {
                processTxt(txtPromise);
            }
        } else {
            handleNoTxt();
        }

        return reverseFederationPromise.promise;

        function handleNoTxt() {
            reverseFederationPromise.reject({
                result: "error",
                error: "noStellarTxt",
                error_message: "Stellar.txt not available for the requested domain."
            });
        }

        function processTxt(txt) {
            if (!txt.reverse_federation_url) {
                reverseFederationPromise.reject({
                    result: "error",
                    error: "noReverseFederation",
                    error_message: "Reverse federation is not available on the requested domain."
                });
                return;
            }

            var config = {
                params: {
                    type: 'reverse_federation',
                    domain: domain,
                    destination_address: address
                }
            }
            $http.get(txt.reverse_federation_url[0], config)
            .success(function (data) {
                if ("object" === typeof data &&
                    "object" === typeof data.federation_json &&
                    data.federation_json.type === "federation_record" &&
                    data.federation_json.destination_address === address &&
                    data.federation_json.domain === domain) {
                    cache[domain] = cache[domain] || {};
                    cache[domain][data.federation_json.destination_address] = reverseFederationPromise.promise;
                    reverseFederationPromise.resolve(data.federation_json);
                } else if ("string" === typeof data.error) {
                    reverseFederationPromise.reject({
                        result: "error",
                        error: "remote",
                        error_remote: data.error,
                        error_message: data.error_message
                            ? "Service error: " + data.error_message
                            : "Unknown remote service error."
                    });
                } else {
                    reverseFederationPromise.reject({
                        result: "error",
                        error: "unavailable",
                        error_message: "Federation gateway's response was invalid."
                    });
                }
            })
            .error(function () {
                reverseFederationPromise.reject({
                    result: "error",
                    error: "unavailable",
                    error_message: "Federation gateway did not respond."
                });
            });
        }
    }

    return {
        check_address: check_address
    };
}]);