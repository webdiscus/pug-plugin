const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/scripts/'),
      Views: path.join(__dirname, 'src/views/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          //method: 'compile',
        },
      },
    ],
  },
};