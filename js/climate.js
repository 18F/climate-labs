(function(exports) {

  /**
   * @param {String} query
   * @return {Object} parsed query string object
   */
  exports.parseQueryString = function(qs) {
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

  /**
   * This function both sets form values if the corresponding keys are set in
   * the provided `data` and sets default values from the form in `data`
   * otherwise. Usage:
   *
   * @example
   * // call it on a selection of form inputs with names:
   * var data = {};
   * d3.selectAll('#some-form [name]')
   *   .call(climate.mergeFormData, data);
   *
   * // at this point, your form inputs and data should match values
   *
   * @param {d3.selection} inputs
   * @param {Object?} data
   */
  exports.mergeFormData = function(inputs, data) {
    if (!data) {
      data = {};
    }
    inputs.each(function() {
      var key = this.name;
      var val = data[key];
      if (val) {
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

  var forEach = function(list, fn, context) {
    return [].forEach.call(list, fn, context);
  };

  if (window.dialogPolyfill) {
    /**
     * If the polyfill is loaded, activate some standard helpers
     * for <dialog> elements:
     *
     * 1. register each <dialog> element with the polyfill
     * 2. find all buttons that target the dialog with
     *    @aria-controls, and add a `click` handler to each that
     *    opens the dialog modally.
     * 3. add `click` handlers for the dialog's <button>
     *    children with @data-action attributes, namely
     *    `data-action="close"`.
     */
    forEach(document.querySelectorAll('dialog'), function(dialog) {
      dialogPolyfill.registerDialog(dialog);

      var selector = '[aria-controls="' + dialog.id + '"]';
      var buttons = document.querySelectorAll(selector);
      forEach(buttons, function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          dialog.showModal();
        });
      });

      forEach(dialog.querySelectorAll('[data-action]'), function(button) {
        button.addEventListener('click', function(e) {
          var action = this.getAttribute('data-action');
          switch (action) {
            case 'close':
              dialog.close();
              break;
          }
        });
      });
    });
  }

})(window.climate = {});
