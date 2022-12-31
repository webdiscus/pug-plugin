const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  entry: {
    index: './src/index.pug',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /\.(js|ts)/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  plugins: [
    new PugPlugin({
      extractComments: false, // disable extracting license into separate file *.LICENSE.txt
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};