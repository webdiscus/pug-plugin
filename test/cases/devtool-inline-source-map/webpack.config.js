const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    styles: './src/assets/main.scss',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          // Load the CSS, set url = false to prevent following urls to fonts and images.
          {
            loader: 'css-loader',
            options: {
              url: false,
              importLoaders: 1,
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
};