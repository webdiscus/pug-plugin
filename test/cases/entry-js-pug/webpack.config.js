const path = require('path');
const PugPlugin = require('../../../');

const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',

    // determines the output filename for js
    filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
  },

  entry: {
    index: './src/pages/index.pug', //                   ==> /index.html
    'assets/js/main': './src/pages/main.js', //          ==> /assets/js/main.js

    'about/index': './src/pages/about/index.pug', //     ==> /about/index.html
    'assets/js/about': './src/pages/about/script.js', // ==> /assets/js/about.js
  },

  plugins: [
    // zero config
    new PugPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          //method: 'render',
        },
      },
    ],
  },
};