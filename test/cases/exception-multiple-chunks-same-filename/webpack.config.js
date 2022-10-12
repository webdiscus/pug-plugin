const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test exception: multiple chunks with same filename:
    // - the `main.css` file is defined here, in entry point
    // - the same `main.css` file is defined in `index.pug`

    // solution:
    // - DON'T use same source file in entry point and in Pug

    index: './src/views/index.pug',
    main: './src/styles/main.css',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: '[name].css', // error: multiple chunks with same filename
        //filename: '[name].[contenthash:8].css', // use a hash in filename to avoid the error
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: PugPlugin.loader,
            options: {
              method: 'render',
            },
          },
        ],
      },

      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};