const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    // test error by execution template function
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      modules: [PugPlugin.extractCss()],
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
        // if a style is required in pug and here is not defined the type, then appear the error
        // type: 'asset/resource', // extract css in pug via require
        // generator: {
        //   filename: 'assets/css/[name].[hash:8].css', // save extracted css in public path
        // },
        use: ['css-loader'],
      },
    ],
  },
};