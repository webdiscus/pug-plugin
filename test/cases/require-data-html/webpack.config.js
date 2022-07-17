const path = require('path');
const PugPlugin = require('../../../');
const fs = require('fs');

module.exports = {
  mode: 'development',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    // test auto publicPath with `html` method
    publicPath: 'auto',
  },

  entry: {
    index: './src/views/home.pug',
    'pages/about': './src/views/about.pug',
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
        test: /\.(png|jpe?g)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};