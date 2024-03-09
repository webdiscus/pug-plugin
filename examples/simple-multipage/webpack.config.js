const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
    clean: true,
  },

  resolve: {
    alias: {
      // use Webpack aliases instead of relative paths like `../../`
      '@images': path.join(__dirname, 'src/assets/images/'),
    },
  },

  plugins: [
    new PugPlugin({
      // auto precessing all Pug templates in the directory
      entry: 'src/views/',
      // OR you can define the templates manually
      // entry: {
      //   index: 'src/views/pages/index.pug', // => dist/index.html
      //   'contact/index': 'src/views/pages/contact/index.pug', // => dist/contact/index.html
      //   'about/index': 'src/views/pages/about/index.pug', // => dist/about/index.html
      // },
      js: {
        // JS output filename
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // CSS output filename
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    open: true, // open in default browser
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
