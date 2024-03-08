const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
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


};
