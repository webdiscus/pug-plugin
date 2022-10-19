const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Views: path.join(__dirname, 'src/views/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    // zero config
    new PugPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },

      {
        test: /\.(css|sass|scss)$/,
        oneOf: [
          // inline styles in HTML
          {
            resourceQuery: /^\?raw/u, // match exact first URL query `?raw`
            type: 'asset/source',
            use: ['css-loader', 'sass-loader'],
          },
          // load styles as file
          {
            use: ['css-loader', 'sass-loader'],
          },
        ],
      },
    ],
  },
};