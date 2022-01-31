const PugPlugin = require('../../../');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  entry: {
    app: './src/assets/app.scss',
  },

  mode: 'development',
  devtool: 'source-map',

  output: {
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          // Extract and save the final CSS.
          // Load the CSS, set url = false to prevent following urls to fonts and images.
          { loader: 'css-loader', options: { url: false, importLoaders: 1, sourceMap: true } },
          // Add browser prefixes and minify CSS.
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer(), cssnano()],
              },
              sourceMap: true,
            },
          },
          // Load the SCSS/SASS
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },

  plugins: [
    // Extract css to .css file
    new PugPlugin({
      modules: [
        PugPlugin.extractCss({
          filename: '[name].bundle.min.css',
        }),
      ],
    }),
  ],
};