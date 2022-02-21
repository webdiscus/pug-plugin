const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  // test no source map
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    styles: './src/assets/main.scss',
  },

  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/[name].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};