// GitHub Page: https://webdiscus.github.io/pug-plugin/multi-language-i18next/

const path = require('path');
const PugPlugin = require('pug-plugin');

// relative public paths to locale pages
const langPath = {
  en: 'en_US/',
  de: 'de_DE/',
};

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist'),
    clean: true,
  },

  entry: {
    // default index page redirect to `en_US/index.html`
    index: 'src/views/pages/index.pug',

    // en pages, pass the variable `lang=en` into Pug via URL query
    'en_US/index': 'src/views/pages/home/index.pug?lang=en',
    'en_US/about': 'src/views/pages/about/index.pug?lang=en',

    // de pages, pass the variable `lang=de` into Pug via URL query
    'de_DE/index': 'src/views/pages/home/index.pug?lang=de',
    'de_DE/about': 'src/views/pages/about/index.pug?lang=de',
  },

  resolve: {
    alias: {
      // use Webpack aliases instead of relative paths like `../../`
      '@views': path.join(__dirname, 'src/views/'),
      '@images': path.join(__dirname, 'src/assets/images/'),
      '@styles': path.join(__dirname, 'src/assets/styles/'),
      '@scripts': path.join(__dirname, 'src/assets/scripts/'),
      '@locales': path.join(__dirname, 'src/locales/'),
    },
  },

  plugins: [
    new PugPlugin({
      js: {
        // output name of a generated JS file
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of styles
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      // pass global variables into all templates
      data: {
        langPath,
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
    //open: 'en_US/index.html',
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
