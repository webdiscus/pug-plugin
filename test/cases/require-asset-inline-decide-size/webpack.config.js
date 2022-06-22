const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: './src/views/index.pug',
    about: './src/views/about.pug?title=hello',
  },

  plugins: [
    new PugPlugin({
      // enable inject inline svg asset
      //inlineAsset: true,
      modules: [
        PugPlugin.extractCss({
          // css output filename
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

      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline images: png or svg icons with size < 2 KB
      {
        test: /\.(png|svg)$/i,
        type: 'asset',
        exclude: /favicon/, // don't inline favicon
        parser: {
          dataUrlCondition: {
            maxSize: 2048, // 2kb
          },
        },
      },
    ],
  },
};