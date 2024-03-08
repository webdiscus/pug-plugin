const path = require('path');
const PugPlugin = require('@test/pug-plugin');

const isProduction = true;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug',
    styles: './src/assets/styles/common.scss',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,

      js: {
        filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      },
      css: {
        filename: isProduction ? 'assets/css/[name].[contenthash:8].css' : 'assets/css/[name].css',
      },
    }),
  ],

  module: {
    rules: [

      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              esModule: true,
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
};
