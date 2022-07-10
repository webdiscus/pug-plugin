const path = require('path');
const PugPlugin = require('../../../');

const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      verbose: true,
      modules: [
        PugPlugin.extractCss({
          verbose: true,
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: PugPlugin.loader,
            options: {
              //method: 'render',
            },
          },
        ],
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};