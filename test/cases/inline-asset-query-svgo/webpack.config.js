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

      // inline svg, with query `?inline`
      {
        test: /\.(svg)$/i,
        resourceQuery: /inline/,
        type: 'asset/inline',
        // test of processing via svgo-loader
        // warning by `npm i svgo-loader`:
        // npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated
        loader: 'svgo-loader',
      },
    ],
  },
};