const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
    about: './src/about.jade',
  },

  plugins: [
    new PugPlugin({
      test: /\.(pug|jade)$/,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(pug|jade)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};