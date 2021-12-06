const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    // exception: file not found
    about: 'src/not-found.pug',
    index: 'src/index.pug',
  },

  plugins: [new PugPlugin()],

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