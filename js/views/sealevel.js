(function(exports) {

  var query = climate.parseQueryString(location.search);

  console.log('query:', location.search, '->', query);

  // update all of the form control values from the query string
  Object.keys(query).forEach(function(key) {
    d3.select('[name="' + key + '"]')
      .property('value', query[key]);
  });

  // update any element with the "data-text" attribute to the corresponding
  // query string value if it's set; otherwise, leave it untouched
  d3.selectAll('[data-text]')
    .datum(function() {
      return this.getAttribute('data-text');
    })
    .filter(function(key) {
      return !!query[key];
    })
    .text(function(key) {
      return query[key];
    });

  var loc = LOCATIONS.filter(function(d) {
    return d.label === query.location;
  })[0];

  var maps = d3.select('#maps');

  if (loc) {

    maps
      .attr('aria-hidden', false)
      .selectAll('climate-map')
        .property('bbox', loc.bbox);

  } else {

    d3.select('#no-location')
      .attr('aria-hidden', false);

  }

})(this);

