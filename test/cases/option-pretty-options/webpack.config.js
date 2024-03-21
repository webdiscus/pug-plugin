const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'development',
  //mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new PugPlugin({
      // test pretty option

      //pretty: true, // enabled for dev and prod
      pretty: 'auto', // in dev is true, in prod is false
      prettyOptions: {
        html: {
          indent_size: 4,
        },
      },
    }),
  ],
};
