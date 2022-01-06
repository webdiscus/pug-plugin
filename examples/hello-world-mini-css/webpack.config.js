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
    styles: './src/assets/styles/common.scss',
    'about-styles': './src/assets/styles/about.css',
    main: './src/main.js',
    // main: {
    //   import: './src/main.js',
    //   filename: '[name]-[contenthash:4].js',
    // },
    index: './src/templates/index.pug',
    about: './src/templates/about.html',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/templates/index.pug',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/about.html',
      filename: 'about.html',
    }),
    new MiniCssExtractPlugin(),
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
    compress: true,
    port: 9000,
    https: false,
    // open in default browser
    open: true,
    // define a development browser
    /*open: {
      app: {
        name: 'Firefox',
      },
    },*/
    liveReload: true,
    hot: true,

    client: {
      progress: true,
    },
  },
};
