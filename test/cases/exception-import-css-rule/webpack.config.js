const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  output: {
    publicPath: '/',
  },

  entry: {
    styles: './src/assets/main.css',
  },

  plugins: [
    // Extract css to .css file
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          verbose: true,
          filename: '[name].[contenthash:4].css',
        }),
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        // Load the CSS, set url = false to prevent following urls to fonts and images.
        use: [{ loader: 'css-loader', options: { url: false, importLoaders: 1, sourceMap: true } }],
      },
    ],
  },
};