const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        // output filename of extracted JS
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        // output filename of extracted CSS
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },

      {
        test: /.css$/,
        use: ['css-loader'],
      },

      {
        test: /.(png|jpe?g|ico|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
