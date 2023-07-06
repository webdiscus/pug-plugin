const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  // Note: in development mode the cache must be false otherwise occur an error by serv after changes in module.js
  //mode: 'development',
  //cache: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};
