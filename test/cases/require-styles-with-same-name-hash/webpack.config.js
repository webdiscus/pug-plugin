const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    home: './src/views/home/index.pug',
    about: './src/views/about/index.pug',
    demo: './src/views/demo/index.pug',
  },

  plugins: [
    new PugPlugin({
      pretty: true,
      extractCss: {
        // test conflict: Multiple chunks emit assets to the same filename
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
        use: ['css-loader'],
      },
    ],
  },
};