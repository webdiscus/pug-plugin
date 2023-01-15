const path = require('path');
const PugPlugin = require('../../../');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = true;

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    // aliases used in the pug template
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
    style: './src/assets/styles/main.scss',
    about: './src/assets/styles/about.css',
  },

  plugins: [
    // extract pug/html only
    new PugPlugin({
      css: {
        enabled: false, // disable embedded extractCss module to bypass extracting via external plugin
      },
    }),
    // extract css with separate plugin
    new MiniCssExtractPlugin(),
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    // test injection of chunks in html
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      minSize: 10,
    },
  },
};