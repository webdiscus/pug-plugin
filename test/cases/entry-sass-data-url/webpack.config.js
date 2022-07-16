const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    styles: './src/assets/scss/main.scss',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: '[name].css',
      },
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
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};