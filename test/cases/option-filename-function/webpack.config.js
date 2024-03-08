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
    about: './src/about.pug',
  },

  plugins: [
    new PugPlugin({
      filename: (pathData, assetInfo) => {
        const name = pathData.chunk.name;
        return name === 'index' ? 'index.html' : 'pages/[name].html';
      },
    }),
  ],
};
