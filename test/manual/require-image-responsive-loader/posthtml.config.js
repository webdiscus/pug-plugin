const path = require('path');

module.exports = {
  plugins: {
    'posthtml-inline-svg': {
      cwd: path.resolve(__dirname, 'src/icons'),
      tag: 'icon',
      attr: 'src'
    }
    /* 'posthtml-beautify': {
      rules: {
        indent: 2,
        blankLines: false
      }
    } */
  }
};
