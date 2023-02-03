const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/home/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
        // test the path relative by output.path
        outputPath: 'assets/js/',
      },
      css: {
        filename: '[name].[contenthash:8].css',
        // test the path relative by output.path
        outputPath: 'assets/css/',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/i,
        type: 'javascript/auto',
        generator: {
          outputPath: 'cdn-assets/',
        },
      },
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};