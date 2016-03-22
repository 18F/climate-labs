(function(exports) {

  var update = function(expanded, scroll) {
    var id = this.getAttribute('aria-controls');
    var el = document.getElementById(id);
    if (el) {
      el.setAttribute('aria-expanded', !!expanded);
      el.setAttribute('aria-hidden', !expanded);
    }
  };

  var hashchange = function(e) {
    var id = location.hash.substr(1);
    if (id && id === this.getAttribute('aria-controls')) {
      this.expanded = true;
      window.requestAnimationFrame(function() {
        document.getElementById(id).scrollIntoView();
      });
    }
  };

  exports.ARIAToggle = xtag.register('aria-toggle', {
    'extends': 'button',

    lifecycle: {
      inserted: function() {
        this.xtag.onhashchange = hashchange.bind(this)
        window.addEventListener('hashchange', this.xtag.onhashchange);
        if (location.hash) {
          hashchange.call(this);
        }
        update.call(this, this.expanded);
      },
      removed: function() {
        window.removeEventListener('hashchange', this.xtag.onhashchange);
        delete this.xtag.onhashchange;
      }
    },

    accessors: {
      expanded: {
        attribute: {
          name: 'aria-expanded',
          validate: function(value) {
            return value && value !== 'false';
          }
        },
        get: function() {
          return this.getAttribute('aria-expanded') === 'true';
        },
        set: function(expanded) {
          update.call(this, expanded);
        }
      }
    },

    events: {
      click: function(e) {
        e.preventDefault();
        this.toggle();
      }
    },

    methods: {
      toggle: function() {
        this.expanded = !this.expanded;
      }
    },

  });

})(this);
