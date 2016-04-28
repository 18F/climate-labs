(function(window) {
  function hasClass(el, c) {
    var classes = el.className.split(' ');
    var match;
    if (classes.length === 0) return false;
    match = classes.find(function(i) { return i === c; });
    if (!match) return false;
    return true;
  }

  document.body.addEventListener('click', function(e) {
    if (e.target.matches('aside h3 span')) {
      var downloadEl = document.querySelector('#downloads');
      if (hasClass(downloadEl, 'open')) {
        return downloadEl.classList.remove('open');
      }
      return downloadEl.classList.add('open');
    }
  });
})(window);
