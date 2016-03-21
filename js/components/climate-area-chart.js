(function(exports) {

  var render = function() {
    var data = this.data;
    var svg = this.xtag.svg;

    var rect = this.getBoundingClientRect();
    var top = 0;
    var left = 10;
    var bottom = rect.height;
    var right = rect.width;

    svg
      .attr('width', rect.width)
      .attr('height', rect.height);

    var keys = Object.keys(data)
      .map(Number)
      .sort(d3.ascending);

    var values = keys
      .map(function(k) { return data[k]; })
      .sort(d3.ascending);

    var y = d3.scale.linear()
      .domain(d3.extent(values))
      .range([bottom, top]);

    var x = d3.scale.linear()
      .domain(d3.extent(keys))
      .range([left, right]);

    svg.select('.y-axis')
      .attr('transform', 'translate(' + [right, 0] + ')')
      .call(d3.svg.axis()
        .orient('left')
        .ticks(3)
        .scale(y));

    svg.select('path.area')
      .datum(keys.map(function(k) {
        return {
          x: +k,
          y: data[k]
        };
      }))
      .attr('d', d3.svg.area()
        .interpolate('cardinal')
        .x(function(d) { return x(d.x); })
        .y1(function(d) { return y(d.y); })
        .y0(bottom));

    delete this.xtag.renderId;
  };

  var resize = function() {
    if (!this.xtag.renderId) {
      this.xtag.renderId = requestAnimationFrame(render.bind(this));
    }
  };

  exports.ClimateAreaChart = xtag.register('climate-area-chart', {
    content: [
      '<svg>',
        '<g class="axis y-axis"></g>',
        '<g class="axis x-axis"></g>',
        '<path class="area"></path>',
      '</svg>'
    ].join(''),

    lifecycle: {
      created: function() {
        this.xtag.svg = d3.select(this).select('svg');
      },
      inserted: function() {
        if (this.hasAttribute('data-values')) {
          var json = this.getAttribute('data-values');
          this.data = JSON.parse(json);
        }
        window.addEventListener('resize', this.xtag.onresize = resize.bind(this));
      },
      removed: function() {
        window.removeEventListener('resize', this.xtag.onresize);
      }
    },

    accessors: {
      data: {
        get: function() {
          return this.xtag.data;
        },
        set: function(data) {
          this.xtag.data = data;
          resize.call(this);
        }
      }
    },

    methods: {
      render: render
    }
  });

})(this);
