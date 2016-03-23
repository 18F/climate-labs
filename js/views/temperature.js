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

  if (loc) {
    d3.select('section[role="main"]').attr('aria-hidden', false);
    d3.select('.location').text(loc.label);
  } else {
    d3.select('#no-location').attr('aria-hidden', false);
    d3.select('section[role="main"]').attr('aria-hidden', true);

    return;
  }

  chartEl.attr('year', d3.select('#year').attr('value'));

  chartEl.on('change:chart', function (e) {
    var data = d3.event.detail.points;
    d3.select('#low').text(data.low.numberOfDays);
    d3.select('#high').text(data.high.numberOfDays);
    d3.select('#likely').text(data.medium.numberOfDays);
  });

  d3.select('#year').on('change', function () {
    chartEl.attr('year', d3.event.target.value);
    d3.selectAll('.year').text(d3.event.target.value);
  });

  d3.select('#temp').on('change', function () {
    var minTemp = d3.event.target.value;
    alterData(function (i) {
      return i + (90 - minTemp);
    });
    chartEl.attr('min-temp', minTemp);
  });

  d3.select('#days').on('change', function () {
    chartEl.attr('day-count', d3.event.target.value);
  });

  d3.select('#download [role="button"]').on('click', function () {
    d3.event.preventDefault();
    alert('Fake downloading 👍');
  });

  d3.select('#download').on('change', function () {
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
    d3.select('#download [role="button"]').text(text);
  });

  function alterData (factor) {
    var sets = [HISTORICAL_DATA, LOW_SCENARIO, HIGH_SCENARIO, MEDIUM_SCENARIO];
    sets.forEach(function(data) {
      data.forEach(function(d, i) {
        if (factor.bind) {
          d.numberOfDays = factor(d.numberOfDays);
          return;
        }

        d.numberOfDays += factor;
      });
    });
  }

  exports.a = alterData;
})(window);
