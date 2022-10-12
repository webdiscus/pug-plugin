const path = require('path');
const PugPlugin = require('../../../');

// Free icon fonts
// - Material icons: https://fonts.google.com/icons
// - Elusive icons: http://elusiveicons.com
// - Ionic icons: https://ionic.io/ionicons
// - Fontawesome icons: https://fontawesome.com/icons
// - Foundation icons: https://zurb.com/playground/foundation-icon-fonts-3
// - Themify Icons: https://themify.me/themify-icons

// Directory structure:
// src/assets/fonts/
// src/assets/fonts/OpenSans/
// src/assets/fonts/icons/
// src/assets/fonts/icons/GlyphIcons/
// src/assets/images/
// src/assets/images/icons/

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Fonts: path.join(__dirname, 'src/assets/fonts/'),
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
    filename: '[name].[contenthash:8].js',
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      extractCss: {
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
          method: 'render',
        },
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // fonts
      {
        test: /\.(woff2?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        include: /assets[\\/]fonts/, // fonts from `assets/fonts` directory
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      // image files
      {
        test: /\.(png|svg|jpe?g|webp|ico)$/i,
        type: 'asset/resource',
        include: /assets[\\/]images/, // images from `assets/images` directory and > 2 KB
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline images: png or svg icons with size < 2 KB
      {
        test: /\.(png|svg)$/i,
        type: 'asset', //-> asset/inline for images < 2 KB
        include: /assets[\\/]images/,
        parser: {
          dataUrlCondition: {
            maxSize: 2 * 1024,
          },
        },
      },
    ],
  },
};