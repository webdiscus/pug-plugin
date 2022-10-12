const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'pages/[name]/scripts.[contenthash:8].js',
  },

  entry: {
    'main/index': './src/views/main/index.pug',
    'about/index': './src/views/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'pages/[name]/styles.[contenthash:8].css',
      },
      modules: [
        {
          test: /\.pug$/,
          outputPath: 'pages/',
        },
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
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};