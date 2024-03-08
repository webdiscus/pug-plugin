const path = require('path');
const PugPlugin = require('@test/pug-plugin');

const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/images/'),
    },
  },

  entry: {
    index: './src/views/home.pug',
    about: './src/views/about.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
