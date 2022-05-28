const PugPlugin = require('../../../');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',

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
        use: [
          {
            loader: 'css-loader',
            options: {
              // node: to allow using @import in CSS file disable the `import` option
              import: true,
            },
          },
        ],
      },
    ],
  },
};