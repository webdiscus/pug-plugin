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

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/assets/images/'),
    },
  },

  entry: {
    index: './src/pages/index.pug',
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
        use: [
          {
            loader: 'css-loader',
            options: {
              //esModule: false, // jest error
            },
          },
          // resolve resources in included npm package, e.g. @import 'material-icons';
          // ACHTUNG BUG in `resolve-url-loader`:
          // when same file imported from different directories,
          // then at 2nd iteration in source file will be the filename not replaced
          'resolve-url-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:4][ext]',
        },
      },

      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
};