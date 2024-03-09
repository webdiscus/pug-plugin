const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

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
    index: './src/views/index.pug',
    about: './src/views/about.pug?title=about', // test import file with query
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [


      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        // auto inline by image size
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
