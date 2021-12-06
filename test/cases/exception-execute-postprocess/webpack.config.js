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
  },

  plugins: [
    new PugPlugin({
      modules: [
        {
          test: /\.(pug)$/,
          postprocess: () => {
            throw new Error('issue an error');
          },
        },
      ],
    }),
  ],

  module: {
    rules: [
      // Templates
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};