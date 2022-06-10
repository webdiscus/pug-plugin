const { merge } = require('webpack-merge');
const config = require('./webpack.common.js');

module.exports = merge(config, {
  mode: 'production',

  output: {
    // build for GitHub Page: https://webdiscus.github.io/pug-plugin/responsive-image/
    publicPath: '/pug-plugin/responsive-image/',
  },
});
