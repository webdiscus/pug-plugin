const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //mode: 'development',

  entry: {
    index: './src/index.pug',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'assets/js/[name].[contenthash:8].js',
    clean: true,
  },

  plugins: [
    new PugPlugin({
      //pretty: true,
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
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
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          // test case: when used min css and js directly in Pug,
          // then the `test` option must match exactly only js files from node_modules,
          // otherwise Webpack merge source JS together with source CSS in one file
          //test: /[\\/]node_modules[\\/]/, // Note: CSS will be not extracted!

          test: /[\\/]node_modules[\\/].+\.(js|ts)$/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};