(function(exports) {
  exports.TemperatureChart = xtag.register('temperature-chart', {
    content: '<svg></svg>',
    lifecycle: {
      created: function () {
        var svg = this.svg = d3.select('svg')
          .attr('width', this.width)
          .attr('height', this.height)
          .append('g');

        var xAxis = d3.svg.axis().scale(this.x).tickFormat(d3.format('0f'));
        var yAxis = d3.svg.axis().scale(this.y).orient('left');

        this.year = this.getAttribute('year');

        svg.append('g')
         .attr('class', 'x axis')
         .attr('transform', 'translate(0, ' + (this.height - this.margin) + ')')
         .call(xAxis);

         svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + this.margin + ', 0)')
          .call(yAxis)
          .append('text')
            .attr('x', -10)
            .attr("y", 16)
            .attr("dy", ".71em")
            .text('Number of days');

        this.drawScenario(HISTORICAL_DATA, 'historical');
        this.drawScenario(LOW_SCENARIO, 'low-scenario');
        this.drawScenario(MEDIUM_SCENARIO, 'medium-scenario');
        this.drawScenario(HIGH_SCENARIO, 'high-scenario');
      },
      attributeChanged: function(name, previous, value) {
        switch (name) {
          case 'year':
          case 'min-temp':
          case 'day-count':
            this[name] = value;
        }
      }
    },
    accessors: {
      firstYear: {
        get: function () {
          return d3.min(getYears(HISTORICAL_DATA, LOW_SCENARIO));
        }
      },
      height: {
        get: function () {
          return 400;
        }
      },
      highNumberOfDays: {
        get: function () {
          return d3.max(getNumberOfDays(HISTORICAL_DATA, HIGH_SCENARIO));
        }
      },
      lastYear: {
        get: function () {
          return d3.max(getYears(HISTORICAL_DATA, LOW_SCENARIO));
        }
      },
      line: {
        get: function () {
          return d3.svg.line()
            .x(function(d) { return this.x(d.year); })
            .y(function(d) { return this.y(d.numberOfDays); });
        }
      },
      lowNumberOfDays: {
        get: function () {
          return d3.min(getNumberOfDays(HISTORICAL_DATA, LOW_SCENARIO));
        }
      },
      margin: {
        get: function () {
          return 50;
        }
      },
      width: {
        get: function () {
          return 500;
        }
      },
      x: {
        get: function () {
          return d3.scale.linear()
            .range([this.margin, this.width - this.margin])
            .domain([this.firstYear, this.lastYear]);
        }
      },
      y: {
        get: function () {
          return d3.scale.linear()
            .range([this.height - this.margin, this.margin])
            .domain([this.lowNumberOfDays, this.highNumberOfDays]);
        }
      },
      year: {
        get: function () {
          return this.xtag.year;
        },
        set: function (value) {
          this.xtag.year = parseInt(value);
          return this.highlightYear(this.xtag.year);
        }
      },
    },
    methods: {
      drawPoints: function (year) {
        var low = LOW_SCENARIO.filter(function(d) {
          return d.year === year;
        })[0];
        var medium = MEDIUM_SCENARIO.filter(function(d) {
          return d.year === year;
        })[0];
        var high = HIGH_SCENARIO.filter(function(d) {
          return d.year === year;
        })[0];

        var points = this.svg.selectAll('circle')
          .data([low, medium, high])
          .enter().append('circle')
          .attr('class', 'point')
          .attr('r', 3)
          .attr('cx', this.x(year))
          .attr('cy', function (d) { return this.y(d.numberOfDays); }.bind(this));

        return points;
      },
      drawScenario: function (data, className) {
        return this.svg.append('path').attr('class', 'line ' + className)
          .attr('d', this.line(data));
      },
      drawVerticalLine: function (year) {
        return this.svg.append('line')
          .attr('x1', this.x(year))
          .attr('x2', this.x(year))
          .attr('y1', this.y(0))
          .attr('y2', this.y(this.highNumberOfDays))
          .attr('class', 'line vertical');
      },
      highlightYear: function (year) {
        if (year > this.lastYear) return;
        this.svg.selectAll('.vertical').remove();
        this.svg.selectAll('.point').remove();

        return {
          line: this.drawVerticalLine(year),
          points: this.drawPoints(year)
        };
      }
    }
  });

  function concatArrays(arrays, key) {
    return Array.prototype.concat.apply([], arrays)
      .map(function (i) { return i[key]; });
  }

  function getYears() {
    var args = Array.prototype.slice.call(arguments);
    return concatArrays(args, 'year');
  }

  function getNumberOfDays() {
    var args = Array.prototype.slice.call(arguments);
    return concatArrays(args, 'numberOfDays');
  }
})(this);
