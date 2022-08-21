const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },

      // inline svg, with query `?inline`
      {
        test: /\.(svg)$/i,
        resourceQuery: /inline/,
        type: 'asset/inline',
        loader: 'svgo-loader', // test svg processed via loader
      },
    ],
  },
};