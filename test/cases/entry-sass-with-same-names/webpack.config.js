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
    index: './src/views/index.pug',
    main: './src/assets/main.scss', // with same name is required the style in pug
    'assets/css/about': './src/views/about/styles.scss',
    'assets/css/contact': './src/views/contact/styles.scss',
  },

  plugins: [
    new PugPlugin({
      // test verbose of extracted assets from entry
      verbose: true,
      // add the `PugPlugin.extractCss()` to extract CSS with pug-plugin anywhere, e.g. via require in pug
      modules: [
        PugPlugin.extractCss({
          verbose: true,
          // Note:
          //   - the [name] for a style in entry is the complete entry name, e.g.:
          //     for `'assets/css/about' : './src/views/about/styles.scss'` the filename is `/somepath/assets/css/about.1234abcd.css`
          //   - the [name] for required file in pug is basename of the file, e.g.:
          //     for `require('../assets/main.scss')` the filename is `/somepath/main.1234abcd.css`
          //
          // !!! MEGA ULTRA IMPORTANT !!!
          // Always use any unique substitutions for required resource, e.g. [id] or [contenthash]
          // to avoid the error `Multiple chunks emit assets to the same filename`.
          // The error appear if more files matched here also will be matched from entry with same basename,
          // see above in entry.
          filename: 'somepath/[name].[contenthash:8].[id].css',
        }),
      ],
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
      {
        test: /\.(css|sass|scss)$/,
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