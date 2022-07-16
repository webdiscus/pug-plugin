const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'public/'),
    // test auto publicPath
    //publicPath: '/',
  },

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/assets/images/'),
    },
  },

  entry: {
    // test import scss via entry point
    vendor: './src/vendor/styles.scss',
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
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
              method: 'render',
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
          // Don't use `resolve-url-loader`, the `pug-plugin` resolves urls in sass much better and faster.
          'sass-loader',
        ],
      },

      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
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