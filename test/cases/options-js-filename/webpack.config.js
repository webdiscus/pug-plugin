const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};