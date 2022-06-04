const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    // aliases used in the pug template
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',

    // the output filename for js
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: './src/pages/index.pug',
  },

  plugins: [
    new PugPlugin({
      verbose: true,
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

      // images loader
      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // image output filename
            // note: github generate different hash as local test
            //name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
            name: 'assets/img/[name]-[width]w.[ext]',
            sizes: [120, 200, 320],
            format: 'webp',
            //placeholder: true, // NOTE: v3.0.2 has bug, this option must be false
          },
        },
      },

      // image resources processing via require() in pug
      // {
      //   test: /\.(png|jpg|jpeg|ico)/,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'assets/img/[name].[hash:8][ext]',
      //   },
      // },
    ],
  },
};