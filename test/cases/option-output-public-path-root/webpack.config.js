const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/', // test publicPath
  },

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
    'about/index': './src/views/about/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      js: {
        filename: 'assets/js/[name].js',
      },
      css: {
        filename: (pathInfo) => {
          // test auto publicPath for CSS url() from different paths
          if (pathInfo.chunk.name === 'common') {
            return 'assets/vendor/css/[name].[contenthash:8].css';
          }
          return 'assets/css/[name].[contenthash:8].css';
        },
      },
    }),
  ],

  module: {
    rules: [


      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpe?g)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
