const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'public/'),
  },

  entry: {
    // Test case multiple chunks with same filename:
    // - the `main.css` file is defined here, in entry point
    // - the same `main.css` file is defined in `index.pug`

    // Note: this use case has no sense and should not be used!
    // Specify all scripts and styles directly in Pug.

    index: './src/views/index.pug',
    main: './src/styles/main.css',
  },

  plugins: [
    new PugPlugin({
      pretty: true,
      extractCss: {
        filename: 'assets/css/[name].[contenthash:8].css',
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