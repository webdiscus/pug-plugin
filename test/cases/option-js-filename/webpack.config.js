const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'js-override/[name].[contenthash:8].js',
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

  plugins: [
    new PugPlugin({
      js: {
        // this option must override the output.filename
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [],
  },
};
