const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    'main/index': './src/views/main/index.pug',
    'about/index': './src/views/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      outputPath: 'pages/',
      js: {
        filename: 'pages/[name]/scripts.[contenthash:8].js',
      },
      css: {
        filename: 'pages/[name]/styles.[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [

      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
