const path = require('path');
const PugPlugin = require('../../../');

const isProduction = true;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',

  resolve: {
    // aliases used in the pug template
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',

    // determines the output filename for js
    filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
  },

  entry: {
    index: './src/pages/index.pug',
  },

  plugins: [
    new PugPlugin({
      // test verbose of extracted assets from entry
      verbose: true,
      // add the `PugPlugin.extractCss()` to extract CSS with pug-plugin anywhere, e.g. via require in pug
      modules: [
        PugPlugin.extractCss({
          verbose: true,
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          //method: 'render',
        },
      },

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {},
          },
          {
            loader: 'sass-loader',
            options: {},
          },
        ],
      },
    ],
  },
};