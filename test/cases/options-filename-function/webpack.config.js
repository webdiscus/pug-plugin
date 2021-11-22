const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: 'src/index.pug',
    about: 'src/about.pug',
  },

  plugins: [
    new PugPlugin({
      filename: (pathData, assetInfo) => {
        const name = pathData.chunk.name;
        return name === 'index' ? 'index.html' : 'pages/[name].html';
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};