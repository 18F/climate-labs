(function(exports) {

  var SUBDOMAINS = 'a b c d'.split(' ');
  var TILE_LAYERS = {
    'toner-lite': 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
    'toner': 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    'terrain': 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'
  };

  var parseLatLng = function(str) {
    if (!str) {
      return null;
    }
    var center = str.split(/\s*,\s*/).map(Number);
    return (center.length === 2 && !center.some(isNaN))
      ? center
      : null;
  };

  var parseControls = function(str) {
    if (str === 'none') {
      return {
        attribution: false,
        zoom: false
      };
    } else if (!str) {
      return {
      };
    };

    return str.split(/\s*;\s*/).reduce(function(controls, spec) {
      var remove = false;
      if (spec.charAt(0) === '-') {
        remove = true;
        spec = spec.substr(1);
      }
      var name = spec;
      var options = {};
      if (spec.indexOf(':') > -1) {
        var parts = spec.split(':', 2);
        name = parts[0];
        options = JSON.parse(parts[1]);
        controls[name] = options;
      } else if (remove) {
        controls[name] = false;
      }
      return controls;
    }, {});
  };

  window.ClimateMap = xtag.register('climate-map', {
    lifecycle: {
      created: function() {
        var center;
        var zoom;

        if (this.hasAttribute('center')) {
          center = parseLatLng(this.getAttribute('center'));
        }

        if (this.hasAttribute('zoom')) {
          zoom = Number(this.getAttribute('zoom'));
        }

        var container = document.createElement('div');
        this.insertBefore(container, this.firstChild);

        var options = {
          center: center,
          zoom: zoom,
          // disable scroll wheel zooming by default
          scrollWheelZoom: false
        };

        var interactive = this.getAttribute('interactive') === 'true';

        var controls = parseControls(this.getAttribute('controls'));
        if (!interactive) {
          controls.zoom = false;
          options.dragging = 
            options.touchZoom = 
            options.boxZoom = 
            options.doubleClickZoom = false;
        }

        var map = L.map(container, options);

        console.log('controls:', controls);

        Object.keys(controls).forEach(function(control) {
          if (controls[control] === false) {
            control = map[control + 'Control'];
            return control ? map.removeControl(control) : false;
          } else {
            var options = controls[control];
            var c = L.control[control](options === true ? {} : options);
            return map.add(c);
          }
        });

        var layerName = this.getAttribute('tiles') ||
          Object.keys(TILE_LAYERS)[0];

        var tileUrl = TILE_LAYERS[layerName] || layerName;
        var tiles = L.tileLayer(tileUrl, {subdomains: SUBDOMAINS})
          .addTo(map);

        this.xtag.map = map;
      },

      attributeChanged: function(name, previous, value) {
        switch (name) {
          case 'center':
          case 'zoom':
            this[name] = value;
            break;
        }
      }
    },

    accessors: {
      center: {
        get: function() {
          return this.xtag.map.getCenter();
        },
        set: function(value) {
          var center = parseLatLng(value);
          return center ? this.xtag.map.setView(center) : false;
        }
      },

      zoom: {
        get: function() {
          return this.xtag.map.getZoom();
        },
        set: function(value) {
          var zoom = +value;
          return isNaN(zoom) ? false : this.xtag.map.setZoom(zoom);
        }
      }
    },

    methods: {
      addLayer: function(layer) {
        return this.xtag.map.add(layer);
      },
      removeLayer: function(layer) {
        return this.xtag.map.remove(layer);
      }
    },

  });

})(this);
