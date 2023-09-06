// GitHub Page: https://webdiscus.github.io/pug-plugin/responsive-image/

const path = require('path');
const PugPlugin = require('pug-plugin');
//const PugPlugin = require('../../'); // for local development only

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'inline-source-map',
    stats: 'minimal',

    entry: {
      index: path.resolve(__dirname, 'src/views/index.pug'),
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
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
        verbose: !isProd,
        js: {
          // output name of a generated JS file
          filename: 'assets/js/[name].[contenthash:8].js',
        },
        css: {
          // output filename of styles
          filename: 'assets/css/[name].[contenthash:8].css',
        },
      }),
    ],

    module: {
      rules: [
        {
          test: /\.(pug)$/,
          loader: PugPlugin.loader,
          options: {
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
                verbose: !isProd,
                use: 'prismjs', // name of a highlighting npm package, must be extra installed
              },
            },
          },
        },

        {
          test: /\.(css|sass|scss)$/,
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
};
