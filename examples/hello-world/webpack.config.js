// GitHub Page: https://webdiscus.github.io/pug-plugin/hello-world/

const path = require('path');
const PugPlugin = require('pug-plugin');

const arvg = process.argv || [];
const isDocs = arvg.includes('type=docs');

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
      '@views': path.join(__dirname, 'src/views/'),
      '@images': path.join(__dirname, 'src/assets/images/'),
      '@fonts': path.join(__dirname, 'src/assets/fonts/'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  plugins: [
    new PugPlugin({
      // auto precessing all Pug templates in the directory
      entry: 'src/views/pages/',
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
      data: {
        // pass global variable into all templates
        publicPath: isDocs ? '/pug-plugin/hello-world/' : '/',
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
        test: /\.(woff2?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        include: /assets[\\/]fonts/, // fonts from `assets/fonts` directory only, match posix and win paths
        generator: {
          // output filename of fonts
          filename: 'assets/fonts/[name][ext][query]',
        },
      },
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

  // performance: {
  //   hints: isProd ? 'error' : 'warning',
  //   // in development mode the size of assets is bigger than in production
  //   maxEntrypointSize: isProd ? 1024000 : 4096000,
  //   maxAssetSize: isProd ? 1024000 : 4096000,
  // },

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
