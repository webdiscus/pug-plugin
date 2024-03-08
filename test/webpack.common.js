module.exports = {
  devtool: false,
  // avoid double error output in console
  stats: 'errors-warnings',

  output: {
    // clean the output directory before emitting
    clean: true,

    //asyncChunks: false,
    //hashSalt: '1234567890',
    //pathinfo: false,
    //hashFunction: require('metrohash').MetroHash64,
    //asyncChunks: false,
  },

  plugins: [],

  module: {
    rules: [],
  },

  optimization: {
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    usedExports: true,
    concatenateModules: true,
  },
};
