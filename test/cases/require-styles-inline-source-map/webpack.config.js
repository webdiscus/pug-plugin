const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
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
        options: {
          method: 'render',
        },
      },

      {
        test: /\.css$/,
        resourceQuery: /raw/,
        type: 'asset/source',
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                // minify CSS
                plugins: [require('cssnano')({ preset: 'default' })],
              },
            },
          },
        ],
      },
    ],
  },
};