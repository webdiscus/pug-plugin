const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'assets/js/[name].[contenthash:4].js',
  },

  entry: {
    index: './src/pages/index.pug',
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
          method: 'compile',
        },
      },
    ],
  },

  optimization: {
    // test injection of chunks in html
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      minSize: 50,
    },
  },
};