const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: {
      import: './src/views/index.pug',
      filename: '[name].html',
    },
    home: {
      import: './src/views/home.pug',
      filename: './pages/[name].html', // output __dirname/public/pages/home.html
    },
    about: './src/views/about.pug',
  },

  plugins: [
    new PugPlugin({
      filename: '[name]-custom.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};