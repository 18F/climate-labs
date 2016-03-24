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

  exports.mergeFormData = function(inputs, data) {
    if (!data) {
      data = {};
    }
    inputs.each(function() {
      var key = this.name;
      var val;
      if (key in data) {
        val = data[key];
        switch (this.type) {
          case 'radio':
          case 'checkbox':
            this.checked = (this.value === val);
            break;
          case 'hidden':
            // don't fill in hidden inputs
            break;
          default:
            this.value = val || '';
            break;
        }
      } else {
        var active = true;
        switch (this.type) {
          case 'radio':
          case 'checkbox':
            active = this.checked;
            break;
        }
        if (active) {
          data[key] = this.value;
        }
      }
    });
  };

})(window.climate = {});
