// GitHub Page: https://webdiscus.github.io/pug-plugin/multi-language-i18next/

const path = require('path');
const PugPlugin = require('pug-plugin');

// relative public paths to locale pages
const langPath = {
  en: 'en_US/',
  de: 'de_DE/',
};

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    stats: 'minimal',

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

    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: 'auto',
      // output filename of scripts
      filename: 'assets/js/[name].[contenthash:8].js',
      clean: true,
    },

    resolve: {
      alias: {
        Images: path.join(__dirname, 'src/assets/images/'),
        Views: path.join(__dirname, 'src/views/'),
        Styles: path.join(__dirname, 'src/assets/styles/'),
        Scripts: path.join(__dirname, 'src/assets/scripts/'),
        Locales: path.join(__dirname, 'src/locales/'),
      },
    },

    plugins: [
      // enable processing of Pug files from entry
      new PugPlugin({
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
            data: {
              langPath,
            },
          },
        },

        // styles
        {
          test: /\.(css|sass|scss)$/,
          use: ['css-loader', 'sass-loader'],
        },

        // images
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
      open: 'en_US/index.html',
      watchFiles: {
        paths: ['src/**/*.*'],
        options: {
          usePolling: true,
        },
      },
    },
  };
};
