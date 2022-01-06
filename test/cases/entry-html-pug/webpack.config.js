const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
    about: './src/about.html',
  },

  plugins: [
    new PugPlugin({
      modules: [
        //{ test: /\.(html)$/, filename: '[name].html' }, // this is equivalent to `PugPlugin.extractHtml()`
        PugPlugin.extractHtml(),
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
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },
};