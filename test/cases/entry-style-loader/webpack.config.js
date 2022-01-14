const path = require('path');
const PugPlugin = require('../../../');

const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    styles: './src/assets/main.scss',
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          // test verbose in extractCss
          verbose: true,
          filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
        }),
      ],
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
      {
        test: /\.(css|sass|scss)$/,
        use: [
          // test case: the usage of 'style-loader' should not affect on extract css
          // normally not need the 'style-loader' with extract css
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            // test ESM
            options: { esModule: true },
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