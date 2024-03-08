const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  resolve: {
    alias: {
      // test: usage alias as relative by root context path
      ScriptsContext: '/src/assets/scripts/',
      // test: usage alias as absolute path
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      preprocessorOptions: {
        // Pug compiler option
        basedir: __dirname,
      },
    }),
  ],
};
