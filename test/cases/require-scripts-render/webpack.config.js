const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
      {
        test: /\.(png|jpg|jpeg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    // test injection of chunks in html
    splitChunks: {
      minChunks: 1,
      minSize: 50,
      cacheGroups: {
        app: {
          test: /\.(js|ts)$/, // <= IMPORTANT: split only script files
          chunks: 'all',
        },
      },
    },
  },
};
