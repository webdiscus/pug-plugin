const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  stats: {
    colors: true,
    preset: 'minimal',
  },

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },

  entry: {
    index: 'src/pages/index.pug',
    'pages/home': 'src/pages/home/index.pug',
    'pages/news': 'src/pages/news/index.pug',
    'pages/about': 'src/pages/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        // output name of a generated JS file
        filename: 'assets/js/[name].[contenthash:4].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:4].css',
      },
    }),
  ],

  module: {
    rules: [

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    https: false,
    compress: true,

    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
