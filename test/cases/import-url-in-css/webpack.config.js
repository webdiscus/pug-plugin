const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  //devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /.(css)$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              // Note: imported CSS files must be manually copied to dist folder using the copy-webpack-plugin
              import: false, // disable @import at-rules handling
            },
          },
        ],
      },
    ],
  },
};
