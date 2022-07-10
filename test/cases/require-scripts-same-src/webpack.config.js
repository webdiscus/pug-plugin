const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    //filename: 'assets/js/[name].js',
    filename: 'assets/js/[name].[contenthash:4].js',
  },

  entry: {
    index: './src/views/index.pug',
    home: './src/views/home.pug',
    about: './src/views/about.pug',
  },

  plugins: [
    new PugPlugin({
      verbose: true,
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