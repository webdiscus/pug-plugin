const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [

      {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              // to enable using @import in CSS file disable the `import` option
              import: true,
            },
          },
        ],
      },
    ],
  },
};
