(function(exports) {
  var query = climate.parseQueryString(location.search);
  var loc = LOCATIONS.filter(function(d) {
    return d.label === query.location;
  })[0];

  Object.keys(query).forEach(function(key) {
    d3.select('[name="' + key + '"]')
      .property('value', query[key]);
  });

  if (loc) {
    var chartEl = document.querySelector('temperature-chart');
    var daysEl = document.querySelector('#days');
    var downloadEl = document.querySelector('#download');
    var tempEl = document.querySelector('#temp');
    var yearEl = document.querySelector('#year');

    yearEl.addEventListener('change', function (e) {
      chartEl.setAttribute('year', e.target.value);
    });

    tempEl.addEventListener('change', function (e) {
      chartEl.setAttribute('min-temp', e.target.value);
    });

    daysEl.addEventListener('change', function (e) {
      chartEl.setAttribute('day-count', e.target.value);
    });

    downloadEl.addEventListener('click', function (e) {
      d3.select('#downloader').attr('aria-hidden', false);
    });
  } else {
    d3.select('#no-location').attr('aria-hidden', false);
  }
})(window);
