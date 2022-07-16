const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'assets/js/[name].[contenthash:8].js',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
          },

          {
            loader: PugPlugin.loader,
            options: {
              method: 'html',
              //method: 'render',
            },
          },
        ],
      },
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
      {
        test: /\.(png|jpg|jpeg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    // test injection of chunks in html
    // splitChunks: {
    //   chunks: 'all',
    //   minChunks: 1,
    //   minSize: 50,
    // },
  },
};