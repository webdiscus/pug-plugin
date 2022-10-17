// GitHub Page: https://webdiscus.github.io/pug-plugin/hello-world/

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
      // !!! ATTENTION !!!
      //
      // The pug-plugin enable to use script and style source files directly in Pug, so easy:
      //
      //   link(href=require('./styles.scss') rel='stylesheet')
      //   script(src=require('./main.js'))
      //
      // Don't define styles and js files in entry. You can require source files of js and scss directly in Pug.
      // Don't use `html-webpack-plugin` to render Pug files in HTML. Pug plugin do it directly from here and much faster.
      // Don't use `mini-css-extract-plugin` to extract CSS from styles. Pug plugin extract CSS from style sources required in Pug.

      // Please, see more details under https://github.com/webdiscus/pug-plugin

      // Yes, You can define Pug files directly in entry, so easy:
      index: 'src/views/pages/home/index.pug',
      contact: 'src/views/pages/contact/index.pug',
      about: 'src/views/pages/about/index.pug',
    },

    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: 'auto',
      // output filename of scripts
      filename: 'assets/js/[name].[contenthash:8].js',
      chunkFilename: 'assets/js/[name].[id].js',
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
      // enable processing of Pug files from entry
      new PugPlugin({
        //verbose: !isProd, // output information about the process to console
        pretty: !isProd, // formatting of HTML
        extractCss: {
          // output filename of styles
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

        // styles
        // {
        //   test: /\.(css|sass|scss)$/,
        //   use: ['css-loader', 'sass-loader'],
        // },
        {
          test: /\.(css|sass|scss)$/,
          oneOf: [
            // inline styles in HTML
            {
              resourceQuery: /^\?raw/u,
              type: 'asset/source',
              use: ['css-loader', 'sass-loader'],
            },
            // load styles as file
            {
              use: ['css-loader', 'sass-loader'],
            },
          ],
        },

        // fonts
        {
          test: /\.(woff2?|ttf|otf|eot|svg)$/,
          type: 'asset/resource',
          include: /assets[\\/]fonts/, // fonts from `assets/fonts` directory only, match posix and win paths
          generator: {
            // output filename of fonts
            filename: 'assets/fonts/[name][ext][query]',
          },
        },

        // images
        {
          test: /\.(png|svg|jpe?g|webp)$/i,
          resourceQuery: { not: [/inline/] }, // ignore images with `?inline` query
          type: 'asset/resource',
          include: /assets[\\/]images/, // images from `assets/images` directory only, match posix and win paths
          generator: {
            // output filename of images
            filename: 'assets/img/[name].[hash:8][ext]',
          },
        },

        // inline images: png or svg icons with size < 4 KB
        {
          test: /\.(png|svg)$/i,
          type: 'asset',
          include: /assets[\\/]images/,
          exclude: /favicon/, // don't inline favicon
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024,
            },
          },
        },

        // force inline svg file containing `?inline` query
        {
          test: /\.(svg)$/i,
          resourceQuery: /inline/,
          type: 'asset/inline',
        },
      ],
    },

    performance: {
      hints: isProd ? 'error' : 'warning',
      // in development mode the size of assets is bigger than in production
      maxEntrypointSize: isProd ? 1024000 : 4096000,
      maxAssetSize: isProd ? 1024000 : 4096000,
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
