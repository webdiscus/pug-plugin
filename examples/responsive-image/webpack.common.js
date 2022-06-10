const path = require('path');
//const PugPlugin = require('pug-plugin');
const PugPlugin = require('../../'); // for local development only

module.exports = {
  stats: 'minimal',

  entry: {
    index: path.resolve(__dirname, 'src/views/index.pug'),
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    // output filename of scripts
    filename: 'assets/js/[name].[contenthash:8].js',
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
      //verbose: true,
      modules: [
        PugPlugin.extractCss({
          // output filename of styles
          filename: 'assets/css/[name].[contenthash:8].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      // pug
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render', // fastest method to generate static HTML files
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
              verbose: true,
              use: 'prismjs', // name of a highlighting npm package, must be extra installed
            },
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
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        include: /assets\/images/, // images from `assets/images` directory only
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
};
