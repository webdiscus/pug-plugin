const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      // test pretty option
      pretty: true,
      modules: [
        {
          test: /\.pug$/,
          postprocess: (content) => {
            //console.log('\n### HTML:\n', content);
            return content;
          },
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
          pretty: false, // not works, is deprecated
        },
      },
    ],
  },
};