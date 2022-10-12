const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/scripts/'),
      Views: path.join(__dirname, 'src/views/'),
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
        oneOf: [
          // import Pug in JavaScript/TypeScript as template function
          {
            issuer: /\.(js|ts)$/,
            loader: PugPlugin.loader,
            options: {
              method: 'compile', // compile Pug into template function
            },
          },
          // render Pug from Webpack entry into static HTML
          {
            loader: PugPlugin.loader, // default method is `render`
          },
        ],
      },
    ],
  },
};