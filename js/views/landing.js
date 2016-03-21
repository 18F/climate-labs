(function(exports){
  var query = window.climate.parseQueryString;
  var params = query(window.location.search);
  var formTest = params ? params.test : false;

  var formEl = document.querySelector('#query-form');
  var searchEl = document.querySelector('search-box');

  if (formTest === 'search') {
    formEl.remove();
  }
  else if (formTest === 'form') {
    searchEl.remove();
  }

  return;
})(window);
