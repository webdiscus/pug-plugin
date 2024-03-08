const path = require('path');
const PugPlugin = require('@test/pug-plugin');

const isProduction = true;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug?' + JSON.stringify({ customData: { options: { title: 'MyTitle' } } }),
  },

  plugins: [
    // zero config
    new PugPlugin({
      js: {
        filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
