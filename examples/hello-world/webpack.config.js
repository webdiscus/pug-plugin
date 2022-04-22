const path = require('path');
const PugPlugin = require('../../');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const isProduction = false;
module.exports = {
  mode: 'production',
  devtool: isProduction ? false : 'source-map',

  resolve: {
    // aliases used in the code example
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public'),
    publicPath: '/',
    filename: 'assets/js/[name].js',
  },

  entry: {
    index: './src/pages/home/index.pug?' + JSON.stringify({ title: 'Homepage' }),
    aboutHtml: {
      import: './src/pages/about/index.pug?' + JSON.stringify({ title: 'About' }),
      filename: 'about.html',
    },
  },

  plugins: [
    // extract HTML from pug files defined by webpack entry
    new PugPlugin({
      //verbose: true,
      modules: [
        PugPlugin.extractHtml(),
        PugPlugin.extractCss({
          //verbose: true,
          filename: isProduction ? 'assets/css/[name].[contenthash:8].css' : 'assets/css/[name].css',
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

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
            options: {},
          },
          // Add browser prefixes and minify CSS.
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer(), cssnano()],
              },
              sourceMap: true,
            },
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
      watch: true,
    },
    port: 9000,
    https: false,
    // liveReload: true,
    // hot: true,
    // client: {
    //   progress: true,
    // },
    // compress: true,
    // headers: {
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    //   'Cross-Origin-Embedder-Policy': 'require-corp',
    // },
    // open in default browser
    // open: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
};
