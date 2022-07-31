const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: '[name].js',
  },

  entry: {
    index: './src/views/index.pug', //                   ==> /index.html
    'assets/js/main': './src/views/main.js', //          ==> /assets/js/main.js

    'about/index': './src/views/about/index.pug', //     ==> /about/index.html
    'assets/js/about': './src/views/about/script.js', // ==> /assets/js/about.js
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
          method: 'compile',
        },
      },
    ],
  },
};