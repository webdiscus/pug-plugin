const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  stats: {
    colors: true,
    preset: 'minimal',
  },

  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/',
    //filename: 'assets/js/[name].js',
    filename: 'assets/js/[name].[contenthash:4].js',
  },

  entry: {
    index: 'src/pages/index.pug',
    'pages/home': 'src/pages/home/index.pug',
    'pages/about': 'src/pages/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      modules: [
        PugPlugin.extractCss({
          filename: 'assets/css/[name].[contenthash:4].css',
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
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 8080,
    https: false,
    compress: true,

    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },

    // open in default browser
    open: true,
  },
};