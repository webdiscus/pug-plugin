const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    //publicPath: '/', // test responsive loader with auto publicPath
    filename: 'assets/js/[name].[contenthash:8].js',
  },

  entry: {
    'pages/home': './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
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
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'assets/img/[name]-[width]w.[ext]',
          },
        },
      },
    ],
  },
};