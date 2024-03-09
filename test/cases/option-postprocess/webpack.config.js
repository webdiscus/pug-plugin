const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      postprocess: (content, info, compilation) => {
        return content.replace('REPLACE ME', 'The new replaced content.');
      },
    }),
  ],

  module: {
    rules: [

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
