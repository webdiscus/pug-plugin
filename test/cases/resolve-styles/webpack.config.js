const path = require('path');
const PugPlugin = require('../../../');
const extractCss = require('../../../src/Modules/extractCss');

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
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
      },
      // test deprecation message
      // TODO: replace the `extractCss` with `css` in v5.0
      extractCss: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'compile',
        },
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};