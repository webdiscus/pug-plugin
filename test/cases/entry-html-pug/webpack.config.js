const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test: render both the HTML and Pug templates
    index: './src/index.pug',
    about: './src/about.html',
  },

  plugins: [
    new PugPlugin({
      test: /\.pug|html$/,
    }),
  ],
};
