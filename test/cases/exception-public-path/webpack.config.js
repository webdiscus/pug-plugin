const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    // exception: publicPath
    publicPath: 'auto',
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [
    new PugPlugin({
      modules: [PugPlugin.extractCss()],
    }),
  ],

  module: {
    rules: [
      // Templates
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};