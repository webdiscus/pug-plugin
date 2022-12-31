const path = require('path');
const PugPlugin = require('../../../');

const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  devtool: false,

  // test: usage of context with relative aliases
  context: srcPath,
  resolve: {
    alias: {
      // test: usage relative by context path
      Scripts: '/assets/scripts/',
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    'home/index': path.join(srcPath, 'views/index.pug'),
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
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