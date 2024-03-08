const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    style: './src/assets/main.scss',
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      css: {
        filename: '[name].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            // test ESM
            options: { esModule: true },
          },
          'sass-loader',
        ],
      },
    ],
  },
};
