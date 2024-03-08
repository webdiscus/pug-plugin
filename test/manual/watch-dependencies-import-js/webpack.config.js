const path = require('path');
const PugPlugin = require('../../..');

module.exports = {
  //mode: 'production', // no error
  mode: 'development', // no error

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new PugPlugin({
      entry: {
        index: './src/index.pug',
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],

  // enable HMR with live reload
  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
