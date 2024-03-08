const path = require('path');
const PugPlugin = require('@test/pug-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    // pass custom data as JSON string via query
    // TODO: fix the space char in values, e.g. `a b` will be incorrect decoded into `a+b`
    index: './src/index.pug?' + JSON.stringify({ customData: { options: { title: 'MyTitle' } } }),
  },

  plugins: [new PugPlugin()],
};
