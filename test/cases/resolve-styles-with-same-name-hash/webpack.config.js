const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    home: './src/views/home/index.pug',
    about: './src/views/about/index.pug',
    demo: './src/views/demo/index.pug',
  },

  plugins: [
    new PugPlugin({
      css: {
        // test conflict: Multiple chunks emit assets to the same filename
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [


      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader'],
      },
    ],
  },
};
