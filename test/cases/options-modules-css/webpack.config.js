const path = require('path');
const PugPlugin = require('../../../');

const basePath = path.resolve(__dirname);

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  resolve: {
    alias: {
      Images: path.join(basePath, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug',
    'assets/css/styles': './src/views/index.css',

    about: './src/views/about/index.pug',
    'assets/css/about': './src/views/about/styles.css',

    'pages/home': './src/views/home/index.pug',
    'assets/css/home': './src/views/home/styles.css',
  },

  plugins: [
    new PugPlugin({
      // test defaults options of extractCss, it is equivalent to:
      // extractCss: {
      //   filename: '[name].css',
      // },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};