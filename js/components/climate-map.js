(function(exports) {

  var CURSOR_STROKE = '#f0f';
  var CURSOR_RADIUS = 6;

  // XXX this is as far in as the NOAA tiles go
  var MAX_ZOOM = 15;

  var SUBDOMAINS = 'a b c d'.split(' ');
  var TILE_LAYERS = {
    background: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
    labels: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png',
    slr: 'https://{s}.coast.noaa.gov/arcgis/rest/services/dc_slr/slr_{depth}ft/MapServer/tile/{z}/{y}/{x}'
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

  var dispatchMapEvent = function(type) {
    return function(e) {
      this.dispatchEvent(new CustomEvent(type || e.type, {
        detail: e
      }));
    };
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
          scrollWheelZoom: false,
          maxZoom: MAX_ZOOM
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

        var move = dispatchMapEvent('move').bind(this);
        ['zoomstart', 'zoomend', 'dragstart', 'dragend']
          .forEach(function(type) {
            map.on(type, move);
          }, this);

        // console.log('controls:', controls);

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
        var tiles = L.tileLayer(tileUrl, {
            subdomains: SUBDOMAINS
          })
          .addTo(map);

        var depth = +this.getAttribute('depth') || 0;
        this.xtag.depthLayer = L.tileLayer(TILE_LAYERS.slr, {
            depth: depth,
            subdomains: ['www', 'maps', 'maps1', 'maps2']
          })
          .addTo(map);

        L.tileLayer(TILE_LAYERS.labels, {
            subdomains: SUBDOMAINS,
            opacity: .8
          })
          .addTo(map);

        this.xtag.cursor = L.circleMarker([0, 0], {
            radius: CURSOR_RADIUS,
            opacity: 0,
            color: CURSOR_STROKE,
            fillOpacity: 0,
            clickable: false,
            pointerEvents: 'none'
          })
          .addTo(map);

        this.xtag.map = map;
      },

      attributeChanged: function(name, previous, value) {
        switch (name) {
          case 'center':
          case 'zoom':
          case 'depth':
            this[name] = value;
            break;
        }
      }
    },

    accessors: {

      map: {
        get: function() {
          return this.xtag.map;
        }
      },

      center: {
        get: function() {
          return this.map.getCenter();
        },
        set: function(value) {
          var center = parseLatLng(value);
          return center ? this.map.setView(center) : false;
        }
      },

      zoom: {
        get: function() {
          return this.map.getZoom();
        },
        set: function(value) {
          var zoom = +value;
          return isNaN(zoom) ? false : this.map.setZoom(zoom);
        }
      },

      bbox: {
        get: function() {
          var bounds = this.map.getBounds();
          return [
            bounds.getWest(),
            bounds.getNorth(),
            bounds.getEast(),
            bounds.getSouth()
          ];
        },
        set: function(bbox) {
          if (!bbox || bbox.length !== 4) {
            throw new Error('Expected [lat,lng,lat,lng]; got: ' + String(bbox));
          }
          return this.map.fitBounds([
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]]
          ]);
        }
      },

      depth: {
        get: function() {
          return this.xtag.depthLayer.options.depth;
        },
        set: function(depth) {
          if (isNaN(depth)) {
            console.warn('invalid depth:', depth);
            return false;
          }
          depth = +depth;
          if (depth !== this.depth) {
            var layer = this.xtag.depthLayer;
            layer.options.depth = depth;
            layer.redraw();
          }
        }
      },

      cursor: {
        get: function() {
          return this.xtag.cursor;
        }
      }

    },

    methods: {

      sync: function(other) {
        var moving = false;
        var self = this;
        this.map
          .on('move', function() {
            moving = true;
            other.map.setView(this.getCenter(), this.getZoom(), {animate: false});
            moving = false;
          })
          .on('mouseover', function(e) {
            other.cursor.setStyle({opacity: 1});
          })
          .on('mousemove', function(e) {
            other.cursor.setLatLng(e.latlng);
          })
          .on('mouseout', function() {
            other.cursor.setStyle({opacity: 0});
          });

        other.map.on('move', function() {
          if (!moving) {
            self.map.setView(this.getCenter(), this.getZoom(), {animate: false});
          }
        });
      }

    },

  });

})(this);
