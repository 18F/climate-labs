(function(exports) {

  window.SearchBox = xtag.register('search-box', {
    content: '<input type="text" placeholder="Search for things here">',
    lifecycle: {
      created: function() {
        var searchIndexSource = this.getAttribute('index-src');
        var container = document.createElement('div');
        this.insertBefore(container, this.firstChild);
      },

      attributeChanged: function(name, previous, value) {
      }
    },

    accessors: {

    },

    methods: {
      getCurrentLocation: function () {
        navigator.geolocation.getCurrentPosition(function(pos) {
          this.currentPosition = pos;
          console.log('pos', pos);
        }.bind(this));
      }
    },

  });

})(this);
