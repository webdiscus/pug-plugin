const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: {
      import: './src/views/index.pug',
      filename: '[name].html',
    },
    home: {
      import: './src/views/home.pug',
      filename: './pages/[name].html', // output __dirname/dist/pages/home.html
    },
    about: './src/views/about.pug',
  },

  plugins: [
    new PugPlugin({
      filename: '[name]-custom.html',
    }),
  ],
};
