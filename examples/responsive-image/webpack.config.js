// GitHub Page: https://webdiscus.github.io/pug-plugin/responsive-image/

const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  stats: 'minimal',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  resolve: {
    alias: {
      Views: path.join(__dirname, 'src/views/'),
      Images: path.join(__dirname, 'src/assets/images/'),
      Fonts: path.join(__dirname, 'src/assets/fonts/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  plugins: [
    new PugPlugin({
      // define templates here
      entry: {
        index: 'src/views/index.pug', // => dist/index.html
      },
      js: {
        // JS output filename
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // CSS output filename
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      // Pug preprocessor options
      preprocessorOptions: {
        // enable filters only those used in pug
        embedFilters: {
          // :escape
          escape: true,
          // :code
          code: {
            className: 'language-',
          },
          // :highlight
          highlight: {
            use: 'prismjs', // name of a highlighting npm package, must be extra installed
          },
        },
      },
      verbose: 'auto', // output to console the information about the processing
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css|sass)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        include: /assets[\\/]images/, // images from `assets/images` directory only, match posix and win paths
        use: {
          loader: 'responsive-loader',
          options: {
            // note: by version >= 3.0.4 default adapter is `sharp`
            // output filename of images
            name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
            //sizes: [320, 640, 960], // use the query `?sizes[]=320,sizes[]=640,sizes[]=960&format=webp`
            //format: 'webp', // use the query `?format=webp` by images where is needed
          },
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
