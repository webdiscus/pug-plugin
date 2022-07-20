const PugPlugin = require('../../../');
const path = require('path');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [new PugPlugin()],

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