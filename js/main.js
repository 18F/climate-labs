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
      console.log('yo');
      var downloadEl = document.querySelector('#downloads');
      var isOpen = hasClass(downloadEl, 'open');
      if (isOpen) {
        return downloadEl.classList.remove('open');
      }
      return downloadEl.classList.add('open');
    }
  });
})(window);
