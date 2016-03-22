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

  var info = d3.select('#info')
    .datum(query)
    .call(updateTemplates);

  var loc = LOCATIONS.filter(function(d) {
    return d.label === query.location;
  })[0];

  var projections = d3.select('#projections')
    .attr('aria-hidden', !loc)
    .selectAll('section');

  var slider = d3.select('#year');

  if (loc) {

    // zoom all the maps
    var maps = projections.select('climate-map')
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

    // XXX
    var scenario = 'high';

    var update = function() {
      var year = query.year = slider.property('value');
      projections
        .datum(function() {
          var index = this.getAttribute('data-proj-index');
          var levels = ANNUAL_SLR_LEVELS_BY_SCENARIO[scenario][year];
          return {
            year: year,
            level: levels ? levels[index] : 0
          };
        })
        .call(updateTemplates)
        .select('climate-map')
          .property('depth', function(d) {
            return d.level;
          });

      info
        .datum(query)
        .call(updateTemplates);
    };

    slider
      .on('change', update)
      .call(update);

  } else {

    d3.select('#no-location')
      .attr('aria-hidden', false);

  }

})(this);
