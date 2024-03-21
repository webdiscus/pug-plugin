const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      // test pretty option

      pretty: {
        html: {
          indent_size: 4,
        },
      },
    }),
  ],
};
