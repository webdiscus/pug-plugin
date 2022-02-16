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
    styles: './src/assets/styles/common.scss',
  },

  plugins: [
    new PugPlugin({
      modules: [
        // add the extractor to handle styles from the entry
        PugPlugin.extractCss({
          verbose: true,
          // the output filename for all styles from the entry
          filename: isProduction ? 'assets/css/[name].[contenthash:8].css' : 'assets/css/[name].css',
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
          method: 'render',
        },
      },

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              esModule: true,
            },
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