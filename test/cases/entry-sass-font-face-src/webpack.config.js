const path = require('path');
const PugPlugin = require('../../../');

const isProduction = true;

module.exports = {
  mode: isProduction ? 'production' : 'development',
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
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {},
          },
          {
            loader: 'sass-loader',
            options: {},
          },
        ],
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        include: path.resolve(__dirname, './src/assets/fonts'),
        generator: {
          filename: 'assets/fonts/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};