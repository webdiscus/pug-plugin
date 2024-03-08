const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  // test default output path
  // output: {
  //   path: path.join(__dirname, 'dist/'),
  // },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    // zero config
    new PugPlugin(),
  ],

  module: {
    rules: [],
  },
};
