stellarExplorer.factory('stellarTxt', ['$http', '$q', '$rootScope', function ($http, $q, $scope) {
  var txts = {};

  function get(domain) {
    if (txts[domain]) {
      return txts[domain];
    } else {
      var txtPromise = $q.defer();

      txts[domain] = txtPromise;

      var urls = [
          'https://www.'+domain+'/stellar.txt',
          'https://'+domain+'/stellar.txt',
          'https://stellar.'+domain+'/stellar.txt'
      ];
      var next = function (xhr, status) {
        if (!urls.length) {
          txts[domain] = {};
          txtPromise.reject(new Error("No stellar.txt found"));
          return;
        }
        var url = urls.pop();
        $http({
          url: url,
          responseType: 'text'
        })
          .success(function (data) {
            var sections = parse(data);
            txts[domain] = sections;
            txtPromise.resolve(sections);
          })
          .error(function (xhr, status) {
            next(xhr, status);
          })
        ;
      };
      next();

      return txtPromise.promise;
    }
  }

  // TODO: Consider using JSON.
  function parse(txt) {
    txt = txt.replace('\r\n', '\n');
    txt = txt.replace('\r', '\n');
    txt = txt.split('\n');

    var currentSection = "", sections = {};
    for (var i = 0, l = txt.length; i < l; i++) {
      var line = txt[i];
      if (!line.length || line[0] === '#') {
        continue;
      } else if (line[0] === '[' && line[line.length-1] === ']') {
        currentSection = line.slice(1, line.length-1);
        sections[currentSection] = [];
      } else {
        line = line.replace(/^\s+|\s+$/g, '');
        if (sections[currentSection]) {
          sections[currentSection].push(line);
        }
      }
    }

    return sections;
  }

  return {
    get: get,
    parse: parse
  };
}]);