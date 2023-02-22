const path = require('path');
const PugPlugin = require('pug-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'inline-source-map' : 'source-map',

    output: {
      path: path.join(__dirname, 'dist'),
    },

    entry: {
      // Define your Pug templates here
      index: 'src/views/home/index.pug', // => dist/index.html
      contact: 'src/views/contact/index.pug', // => dist/contact.html
      about: 'src/views/about/index.pug', // => dist/about.html
    },

    resolve: {
      alias: {
        // use Webpack aliases instead of relative paths like ../../
        Images: path.join(__dirname, 'src/assets/images/'),
      },
    },

    plugins: [
      new PugPlugin({
        js: {
          // output name of a generated JS file
          filename: 'assets/js/[name].[contenthash:8].js',
        },
        css: {
          // output name of a generated CSS file
          filename: 'assets/css/[name].[contenthash:8].css',
        },
      }),
    ],

    module: {
      rules: [
        // templates
        {
          test: /\.pug$/,
          loader: PugPlugin.loader,
        },

        // styles
        {
          test: /\.(css|sass|scss)$/,
          use: ['css-loader', 'sass-loader'],
        },

        // images
        {
          test: /[\\/]images[\\/].+\.(png|svg|jpe?g|webp)$/i,
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
      //open: true, // open in default browser
      watchFiles: {
        paths: ['src/**/*.*'],
        options: {
          usePolling: true,
        },
      },
    },
  };
};
