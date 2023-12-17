const path = require('path');
const PugPlugin = require('../../..');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  entry: {
    index: './src/index.pug',
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

  // enable HMR with live reload
  devServer: {
    //hot: false,
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
