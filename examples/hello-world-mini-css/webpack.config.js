const path = require('path');
const PugPlugin = require('../../');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
    app: './src/main.js',

    styles: './src/assets/styles/styles.scss',
    about: './src/assets/styles/about.css',
    vendor: './src/assets/styles/vendor.css',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/templates/index.pug',
      filename: 'index.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/about.html',
      filename: 'about.html',
      inject: false,
    }),
    new MiniCssExtractPlugin({
      filename: isProduction ? 'assets/css/[name].[contenthash:8].css' : 'assets/css/[name].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader, // the pug-loader is already included in the PugPlugin
        options: {
          method: 'render',
        },
      },
      // image resources processing via require() in pug
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash][ext]',
        },
      },

      // style loader
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
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
        options: {
          // disable processing of resources in static HTML, leave as is
          sources: false,
        },
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
