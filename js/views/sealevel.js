(function(exports) {

  var query = climate.parseQueryString(location.search);

  var updateTemplates = function() {
    // update any element with the "data-text" attribute to the corresponding
    // query string value if it's set; otherwise, leave it untouched
    this.each(function(data) {
      d3.select(this)
        .selectAll('[data-text]')
          .datum(function() {
            return this.getAttribute('data-text');
          })
          .filter(function(key) {
            return !!data[key];
          })
          .text(function(key) {
            return data[key];
          });
    });
  };

  // console.log('query:', location.search, '->', query);

  // update all of the form control values from the query string
  Object.keys(query).forEach(function(key) {
    d3.select('[name="' + key + '"]')
      .property('value', query[key]);
  });

  d3.select('body')
    .datum(query)
    .call(updateTemplates);

  var loc = LOCATIONS.filter(function(d) {
    return d.label === query.location;
  })[0];

  var scenarios = d3.select('#scenarios')
    .attr('aria-hidden', !loc)
    .selectAll('[data-scenario]');

  var slider = d3.select('#year');

  if (loc) {

    // zoom all the maps
    var maps = scenarios.select('climate-map')
      .property('bbox', loc.bbox);

    // sync all the maps!
    maps.each(function(d, j) {
      var self = this;
      maps.each(function(_, k) {
        if (j !== k) {
          self.sync(this);
        }
      });
    });

    var update = function() {
      var year = slider.property('value');
      scenarios
        .datum(function() {
          var scenario = this.getAttribute('data-scenario');
          var levels = ANNUAL_SLR_LEVELS_BY_SCENARIO[scenario];
          return {
            year: year,
            scenario: scenario,
            level: levels ? levels[year] : 0
          };
        });

      scenarios.call(updateTemplates);

      scenarios.select('climate-map')
        .property('depth', function(d) {
          return d.level;
        });
    };

    slider
      .on('change', update)
      .call(update);

  } else {

    d3.select('#no-location')
      .attr('aria-hidden', false);

  }

})(this);
