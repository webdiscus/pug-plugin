const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    // test default filename for js
    filename: 'js/[name].[contenthash:8].js',
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/js/'),
    },
  },

  entry: {
    index: './src/index.pug?lang=en',
    'de/index': './src/index.pug?lang=de',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [],
  },
};
