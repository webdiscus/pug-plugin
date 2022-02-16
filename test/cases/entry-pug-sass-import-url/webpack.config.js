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
    //styles: './src/assets/scss/main.scss',
    //font: './src/assets/scss/abstract/_variables.scss',
    index: './src/pages/index.pug',
  },

  plugins: [
    new PugPlugin({
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
            options: {},
          },
          // using the extractCss this loader is needles
          // {
          //   loader: 'resolve-url-loader',
          // },
          {
            loader: 'sass-loader',
            options: {},
          },
        ],
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        //include: path.resolve(__dirname, './src/assets/fonts'),
        generator: {
          filename: 'assets/fonts/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};