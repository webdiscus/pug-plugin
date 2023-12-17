const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test the compiled template function used in the html
    index: './src/index.pug',
    // test the compiled template function standalone, e.g., as a component
    myComponent: './src/component/component.js',
  },

  plugins: [
    new PugPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};
