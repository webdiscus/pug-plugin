const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  resolve: {
    alias: {
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
    main: './src/assets/styles/file2.scss', // test warning: style is not allowed in entry
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
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};