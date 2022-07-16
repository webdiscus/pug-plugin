const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    // pass custom data as JSON string via query
    index: './src/index.pug?customData=' + JSON.stringify({ options: { title: 'My title' } }),
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};