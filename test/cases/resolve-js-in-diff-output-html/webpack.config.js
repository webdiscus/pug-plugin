const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    // test auto path
    publicPath: 'auto',
    // test output non hashed js filename
    filename: '[name].js',
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/js/'),
      Styles: path.join(__dirname, 'src/css/'),
    },
  },

  entry: {
    // test relative CSS paths when used one style in one Pug file which is generated with different output paths
    index: './src/index.pug?lang=en',
    'de/index': './src/index.pug?lang=de',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
    ],
  },
};