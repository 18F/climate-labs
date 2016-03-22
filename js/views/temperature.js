(function(exports) {
  var query = climate.parseQueryString(location.search);
  var loc = LOCATIONS.filter(function(d) {
    return d.label === query.location;
  })[0];

  Object.keys(query).forEach(function(key) {
    d3.select('[name="' + key + '"]')
      .property('value', query[key]);
  });

  var chartEl = d3.select('temperature-chart');

  d3.select('#year').on('change', function () {
    chartEl.attr('year', d3.event.target.value);
  });

  d3.select('#temp').on('change', function () {
    chartEl.attr('min-temp', d3.event.target.value);
  });

  d3.select('#days').on('change', function () {
    chartEl.attr('day-count', d3.event.target.value);
  });

  d3.select('#download').on('click', function () {
    d3.select('#downloader').attr('aria-hidden', false);
  });

  d3.select('#downloader button').on('click', function () {
    d3.event.preventDefault();
    alert('Fake downloading 👍');
  });

  d3.select('#downloader form').on('change', function () {
    function calculateFileSize(n) {
      if (n === 0) return 0;
      return 14 + (n * 1.4);
    }

    function numberOfChecks(t) {
      var c = Array.prototype.slice.call(t.querySelectorAll('[type="checkbox"]'));
      return c.filter(function(d) { return d.checked; }).length;
    }

    var number = numberOfChecks(d3.event.currentTarget);
    var text = ['Download', calculateFileSize(number), 'MB file'].join(' ');
    d3.select('#downloader button').text(text);
  });

  if (loc) {
    d3.select('section[role="main"]').attr('aria-hidden', false);
  } else {
    d3.select('#no-location').attr('aria-hidden', false);
    d3.select('section[role="main"]').attr('aria-hidden', true);
  }
})(window);
