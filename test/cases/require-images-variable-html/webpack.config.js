const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: './src/views/index.pug?customData=' + JSON.stringify({ options: { title: 'The title' } }),
  },

  plugins: [
    // zero config
    new PugPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          {
            loader: PugPlugin.loader,
            options: {
              method: 'html',
              esModule: true,
            },
          },
        ],
      },

      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};