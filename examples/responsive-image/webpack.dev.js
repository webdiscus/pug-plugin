const { merge } = require('webpack-merge');
const config = require('./webpack.common.js');
const path = require('path');

module.exports = merge(config, {
  mode: 'development',
  devtool: 'source-map',

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    //port: 8080,
    https: false,
    compress: true,

    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },

    // open in default browser
    //open: true,
  },
});
