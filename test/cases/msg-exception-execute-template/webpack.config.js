const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    // test error by execution template function
    index: './src/index.pug',
  },

  plugins: [new PugPlugin({})],
};
