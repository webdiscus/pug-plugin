const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/scripts/'),
      Views: path.join(__dirname, 'src/views/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [new PugPlugin()],
};
