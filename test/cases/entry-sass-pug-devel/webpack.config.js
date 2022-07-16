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
    styles: './src/assets/main.scss',
    index: './src/index.pug',
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