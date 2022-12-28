const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    // test auto path
    publicPath: 'auto',
    // test output js filename
    filename: '[name].js',
    //filename: '[name].[contenthash:8].js',
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/js/'),
      Styles: path.join(__dirname, 'src/css/'),
    },
  },

  // test same entry key 'index' for html and js files => index.1.js, index.2.js, but must be index.js
  entry: {
    // test relative CSS paths when used one style in one Pug file which is generated with different output paths
    index: './src/index.pug?lang=en',
    'de/index': './src/index.pug?lang=de',

    // en: {
    //   import: './src/index.pug?lang=en',
    //   filename: 'index.html',
    // },
    // de: {
    //   import: './src/index.pug?lang=de',
    //   filename: 'de/index.html',
    // },
  },

  plugins: [
    new PugPlugin({
      css: {
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