const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'pages/[name]/scripts.[contenthash:4].js',
  },

  entry: {
    'main/index': './src/views/main/index.pug',
    'about/index': './src/views/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      modules: [
        PugPlugin.extractCss({
          filename: 'pages/[name]/styles.[contenthash:4].css',
        }),
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