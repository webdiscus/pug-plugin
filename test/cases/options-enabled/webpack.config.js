const path = require('path');
const PugPlugin = require('../../../');

const basePath = path.resolve(__dirname);
const sourcePath = path.join(basePath, 'src/');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(basePath, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    // zero config
    new PugPlugin({
      // test disable plugin
      enabled: false,
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
};