const path = require('path');
const PugPlugin = require('../../../');

const isProduction = true;
//const isProduction = false;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'assets/js/[name].[contenthash:4].js',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      verbose: true,
      modules: [
        // add the extractor to handle styles from the entry
        PugPlugin.extractCss({
          verbose: true,
          // the output filename for all styles from the entry
          filename: 'assets/css/[name].[contenthash:4].css',
        }),
      ],
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
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:4][ext]',
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