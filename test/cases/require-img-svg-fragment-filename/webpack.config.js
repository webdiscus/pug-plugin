const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  stats: {
    children: true,
  },

  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|svg)$/,
        type: 'asset/resource',
        generator: {
          // test: remove [fragment] in output asset filename
          // note: the '[fragment]' is used in filename for use SVG fragments
          // <svg width="24" height="24"><use href="./icons.svg#home"></use></svg>
          filename: 'assets/images/[name].[hash:8][ext][fragment][query]',
        },
      },
    ],
  },
};
