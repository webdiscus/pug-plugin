const path = require('path');
const PugPlugin = require('../../../');
const fs = require('fs');

const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',

    // determines the output filename for js
    filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
  },

  entry: {
    index: './src/pages/index.pug',
    about: './src/pages/about.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: {
                urlFilter: (attribute, value) => path.isAbsolute(value) && fs.existsSync(value),
              },
            },
          },
          {
            loader: PugPlugin.loader,
            options: {
              method: 'html',
            },
          },
        ],
      },

      {
        test: /\.(png|jpg|jpeg)/,
        type: 'asset/resource', // process required images in pug
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};