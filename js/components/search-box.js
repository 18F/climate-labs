(function(exports) {

  window.SearchBox = xtag.register('search-box', {
    lifecycle: {
      created: function() {
        var searchIndexSource = this.getAttribute('index-src');
        var container = document.createElement('div');
        this.insertBefore(container, this.firstChild);

        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search for things here';

        container.insertBefore(input, container.firstChild);
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
