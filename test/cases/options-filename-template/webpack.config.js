const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: {
      import: './src/index.pug',
      filename: '[name].html',
    },
    about: './src/about.pug',
  },

  plugins: [
    new PugPlugin({
      filename: '[name]-[contenthash:6]-[id].html',
    }),
  ],

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