module.exports = {
  output: {
    filename: '[name].js',
    assetModuleFilename: 'assets/images/[hash][ext][query]',
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