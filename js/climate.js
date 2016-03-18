(function(exports) {

  exports.parseQueryString = function parseQueryString(qs) {
    if (!qs || qs === '?') {
      return {};
    }

    var parts = qs.replace(/^\?/, '').split('&');
    var decode = function(str) {
      return decodeURIComponent(str).replace(/\+/g, ' ');
    };

    return parts.reduce(function(q, part) {
      var i = part.indexOf('=');
      if (i > -1) {
        var key = part.substr(0, i);
        var val = part.substr(i + 1);
        q[key] = decode(val);
      } else {
        q[part] = true;
      }
      return q;
    }, {});

  };

})(window.climate = {});
