const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  //mode: 'development',
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

      pretty: true, // enabled with default options
      // if pretty is an object, then pretty is enabled for dev and prod
      // pretty: {
      //   html: {
      //     indent_size: 4,
      //   },
      // },
    }),
  ],
};
