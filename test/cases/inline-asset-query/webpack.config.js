const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },

      // image file, without query `?inline`
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/i,
        resourceQuery: { not: [/inline/] },
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline svg, with query `?inline`
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/i,
        resourceQuery: /inline/,
        type: 'asset/inline',
      },
    ],
  },
};