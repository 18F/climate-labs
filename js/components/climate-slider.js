(function(exports) {
  // requires: d3

  /**
   * create a numeric accessor by name (underlying values are
   * stored in `this.xtag[name]`), with an optional default
   * value and change handler.
   *
   * @param {String} name
   * @param {*?} defaultValue
   * @param {Function?} change
   * @return Object an object descriptor with `get` and `set`
   * properties
   */
  var numericAccessor = function(name, defaultValue, change) {
    defaultValue = d3.functor(defaultValue);
    return {
      get: function() {
        return (name in this.xtag)
          ? this.xtag[name]
          : (this.xtag[name] = defaultValue.call(this));
      },
      set: function(value) {
        value = +value;
        if (isNaN(value)) {
          return false;
        }
        var old = this.xtag[name];
        if (old !== value) {
          this.xtag[name] = value;
          var ok = change ? change.call(this, value, old) : true;
          if (ok === false) {
            this.xtag[name] = old;
            return false;
          }
          this.render();
        }
      }
    };
  };

  // round a number by a given step interval
  var round = function(n, step) {
    return Math.round(n / step) * step;
  };

  // create a linear interpolation function that maps a number
  // from a supplied range to a clamped float between 0 and 1.
  var lerp = function(min, max) {
    return function(v) {
      var n = (v - min) / (max - min);
      return Math.max(0, Math.min(n, 1));
    };
  };

  // the thumb "capture" event handler establishes the bounding
  // box of the slider, updates the value with the
  // clicked/touched position, and sets up move/touch handlers
  // for drag updating
  var captureThumb = function(e) {
    if (e.button > 0) {
      return false;
    }

    var rect = this.getBoundingClientRect();
    var left = lerp(0, rect.width);
    var min = this.min;
    var max = this.max;

    // console.info('capture', e, min, ' <= x <=', max);

    var update = (function(e) {
      var x = e.pageX - rect.left;
      var value = min + left(x) * (max - min);
      // console.info('value:', e.layerX, e.pageX, value, '<=', rect.width);
      this.value = value;

      // prevent text selection on drag
      e.preventDefault();
    }).bind(this);

    this.setAttribute('aria-grabbed', true);

    var detach = (function(e) {
      this.setAttribute('aria-grabbed', false);

      // console.info('detach', e);
      window.removeEventListener('mousemove', update);
      window.removeEventListener('touchmove', update);
      window.removeEventListener('mouseup', detach);
      window.removeEventListener('touchend', detach);
    }).bind(this);

    update(e);

    window.addEventListener('mousemove', update);
    window.addEventListener('touchmove', update);
    window.addEventListener('mouseup', detach);
    window.addEventListener('touchend', detach);
  };

  exports.ClimateSlider = xtag.register('climate-slider', {
    // create a thumb div
    content: [
      '<div class="climate-slider-thumb">',
        '<span class="climate-slider-label"></span>',
      '</div>'
    ].join(''),

    lifecycle: {
      created: function() {
        this.setAttribute('role', 'slider');
      },

      inserted: function() {
        var thumb = this.querySelector('.climate-slider-thumb');
        // TODO: thumb keyboard accessibility, see
        // <https://www.w3.org/TR/wai-aria/roles#slider>
        this.xtag.thumb = thumb;

        if (this.getAttribute('label') === 'true') {
          this.xtag.label = this.querySelector('.climate-slider-label');
        }

        this.addEventListener('mousedown', captureThumb);
        this.addEventListener('touchstart', captureThumb);

        // XXX this will call render() each time
        ['min', 'max', 'step', 'value'].forEach(function(name) {
          if (this.hasAttribute(name)) {
            this[name] = this.getAttribute(name);
          }
        }, this);

        var input = this.querySelector('input');
        if (input) {
          var slider = this;
          this.xtag.onsliderchange = function() {
            console.log('input change:', this.value);
            slider.value = this.value;
          };
          input.addEventListener('change', this.xtag.onsliderchange);
          this.xtag.input = input;
          if (input.hasAttribute('value')) {
            this.value = input.value;
          }
        }

      },

      removed: function() {
        if (this.xtag.input) {
          this.xtag.input.removeEventListener(
            'change',
            this.xtag.onsliderchange
          );
        }
        this.removeEventListener('mousedown', captureThumb);
        this.removeEventListener('touchstart', captureThumb);
      }
    },

    accessors: {
      min: numericAccessor('min', 0),
      max: numericAccessor('max', 100),
      step: numericAccessor('step', 1),
      value: numericAccessor('value', function() {
        return this.min;
      })
    },

    methods: {
      render: function() {
        var x = lerp(this.min, this.max);
        var value = round(this.value, this.step);

        if (value !== this.value) {
          this.xtag.value = value;
          this.dispatchEvent(new CustomEvent('change', {value: value}));
        }

        var left = (x(value) * 100).toFixed(3);
        this.xtag.thumb.style.setProperty('left', left + '%');

        // set ARIA attributes
        this.setAttribute('aria-valuemin', this.min);
        this.setAttribute('aria-valuemax', this.max);
        this.setAttribute('aria-valuenow', value);

        // if there's an underlying input, set its value
        if (this.xtag.input) {
          this.xtag.input.value = value;
        }

        var label = this.xtag.label;
        if (label) {
          label.textContent = value;
          var rect = label.getBoundingClientRect();
          label.style.setProperty('margin-left', Math.floor(-rect.width / 2) + 'px');
        }
      }
    }
  });

})(this);
