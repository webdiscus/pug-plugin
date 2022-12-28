const fs = require('fs');
const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              // Test: transformation of ESM to CommonJS source in PugPlugin.extractHtml
              //esModule: true,
              sources: {
                // Static resource URL from public web path should not be parsed.
                // Leave as is:
                //   img(src='/assets/image.png')
                //   link(rel='stylesheet' href='assets/styles.css')
                // Must be processed:
                //   img(src=require('./image.png'))
                //   link(rel='stylesheet' href=require('./styles.css'))
                urlFilter: (attribute, value) => path.isAbsolute(value) && fs.existsSync(value),
              },
            },
          },
          {
            loader: PugPlugin.loader,
            options: {
              method: 'html',
              //method: 'render',
            },
          },
        ],
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
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