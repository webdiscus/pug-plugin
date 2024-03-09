const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: 'inline-source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'auto',
  },

  resolve: {
    alias: {
      Fonts: path.join(__dirname, 'src/fonts/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      css: {
        // test conflict: Multiple chunks emit assets to the same filename
        filename: 'assets/css/[name].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        include: /[\\/]fonts/,
        generator: {
          //filename: 'assets/fonts/[name][ext][query]',
          filename: (pathData) => `assets/fonts/${path.basename(path.dirname(pathData.filename))}/[name][ext][query]`,
        },
      },
    ],
  },
};
