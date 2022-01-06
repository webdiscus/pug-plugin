const path = require('path');
const PugPlugin = require('../../');

const isProduction = false; //process.env.NODE_ENV === 'production';
module.exports = {
  mode: 'production',
  devtool: isProduction ? false : 'source-map',

  resolve: {
    // aliases used in the code example
    alias: {
      App: path.join(__dirname, 'src/app/'),
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
      Templates: path.join(__dirname, 'src/templates/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/',
    filename: '[name].js',
  },

  entry: {
    styles: './src/assets/styles/common.scss',
    'about-styles': './src/assets/styles/about.css',
    main: './src/main.js',
    // main: {
    //   import: './src/main.js',
    //   filename: '[name]-[contenthash:4].js',
    // },
    index: 'src/templates/index.pug',
    about: './src/templates/about.html',
  },

  plugins: [
    // extract HTML from pug files defined by webpack entry
    new PugPlugin({
      verbose: true,
      modules: [
        PugPlugin.extractHtml(),
        PugPlugin.extractCss({
          //filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug-loader is already included in the PugPlugin
        options: {
          method: 'render',
          esModule: true,
        },
      },
      // image resources processing via require() in pug
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash][ext][query]',
        },
      },

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        type: 'asset/resource', // add this for usage in pug, like `link(href=require('~Styles/my-style.scss'))`
        generator: {
          // save required styles
          filename: 'assets/css/[name].[hash].css[query]',
        },
        use: [
          {
            loader: 'css-loader',
            options: {},
          },
          {
            loader: 'sass-loader',
            options: {},
          },
        ],
      },

      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },

  optimization: {
    splitChunks: {
      //chunks: 'all',
      maxSize: 5000,
      minSize: 5000,
    },
  },

  performance: {
    hints: isProduction ? 'error' : 'warning',
    // in development mode may be the size of css and js more times bigger than in production
    maxEntrypointSize: isProduction ? 1024000 : 4096000,
    maxAssetSize: isProduction ? 1024000 : 4096000,
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 9000,
    https: false,
    liveReload: true,
    hot: true,
    client: {
      progress: true,
    },
    compress: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    // open in default browser
    open: true,
    // open in the browser
    // open: {
    //   app: {
    //     name: 'Firefox',
    //   },
    // },
  },
};
