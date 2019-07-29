'use strict';

var stylus = require('stylus');

module.exports = function (options) {
  return function (str, filename) {
    stylus(str)
      .set('filename', filename)
      .set('include css', options['include-css'])
      .render(function (err, css) {
        if (err)
          console.error(err.toString());
        else
          console.log(css);
      });
  };
}
