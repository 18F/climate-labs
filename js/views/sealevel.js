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

  // update all of the form control values from the query string
  var controls = d3.selectAll('#controls [name]')
    .each(function() {
      var key = this.name;
      var val = query[key];
      switch (this.type) {
        case 'radio':
        case 'checkbox':
          this.checked = (this.value === val);
          break;
        case 'hidden':
          // don't fill in hidden inputs
          break;
        default:
          this.value = val;
          break;
      }
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

    var update = function() {
      var year = query.year = slider.property('value');
      var scenario = query.scenario;
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
