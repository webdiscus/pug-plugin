const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    home: './src/views/home/index.pug',
    about: './src/views/about/index.pug',
    demo: './src/views/demo/index.pug',
  },

  plugins: [
    new PugPlugin({
      verbose: true,
      modules: [
        PugPlugin.extractCss({
          verbose: true,
          // test conflict: Multiple chunks emit assets to the same filename
          filename: 'assets/css/[name].css',
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
          method: 'render',
        },
      },

      // style loader for webpack entry and processing via require() in pug
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
};