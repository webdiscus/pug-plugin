const path = require('path');
const PugPlugin = require('../../../');
//const PugPlugin = require('pug-plugin');

const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  devtool: false,

  // test: usage of context with relative aliases
  context: srcPath,
  resolve: {
    alias: {
      // test: usage relative by context path
      Images: '/assets/images/',
      Styles: '/assets/styles/',
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    // the output filename for js
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: path.join(srcPath, 'pages/index.pug'),
  },

  plugins: [
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
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
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
};