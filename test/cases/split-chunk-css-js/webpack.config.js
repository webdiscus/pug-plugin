const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  entry: {
    index: './src/index.pug',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new PugPlugin({
      js: {
        // test verbose for JS
        verbose: true,
        filename: 'assets/js/[name].[contenthash:8].js',
      },
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