(function(exports){
  exports.parseURLParameters = function (qs) {
    var params = qs.replace(/^\?/g, '').split('&');
    var ps = {};

    params.forEach(function(p) {
      var parts;
      if (p) {
        parts = p.split('=');
        ps[parts[0]] = parts[1];
      }
    });

    return ps;
  };

  var params = parseURLParameters(window.location.search);
  var formTest = params ? params.test : false;

  var formEl = document.querySelector('#query-form');
  var searchEl = document.querySelector('search-box');

  if (formTest === 'search') {
    formEl.remove();
  }
  else if (formTest === 'form') {
    searchEl.remove();
  }

  return;
})(window);
