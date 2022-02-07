const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',

    // determines the output filename for js
    filename: '[name].js',
  },

  entry: {
    index: './src/pages/index.pug',
    'assets/css/about': './src/pages/about/styles.scss',
    'assets/css/contact': './src/pages/contact/styles.scss',
  },

  plugins: [
    new PugPlugin({
      // test verbose of extracted assets from entry
      verbose: true,
      // add the `PugPlugin.extractCss()` to extract CSS with pug-plugin anywhere, e.g. via require in pug
      modules: [PugPlugin.extractCss({ verbose: true })],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          //method: 'render',
        },
      },

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        type: 'asset/resource', // add this for usage in pug, like `link(href=require('~Styles/my-style.scss'))`
        generator: {
          // Save styles required in pug.
          // !!! MEGA ULTRA IMPORTANT !!!
          // Always use any unique substitutions for required resource, e.g. [id] or [hash]
          // to avoid the error `Multiple chunks emit assets to the same filename`.
          // The error appear if more files matched here also wil be matched from entry with same basename,
          // see above in entry.
          filename: 'assets/css/[name].[id].css',
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
    ],
  },
};