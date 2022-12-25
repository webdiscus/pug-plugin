const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: '[name].[contenthash:8].js',
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/js/'),
      Styles: path.join(__dirname, 'src/css/'),
    },
  },

  entry: {
    'en/index': './src/index.pug?lang=en',
    'de/index': './src/index.pug?lang=de',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
    ],
  },
};