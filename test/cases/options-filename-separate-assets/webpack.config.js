const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'js/[name].[contenthash:8].js',
  },

  entry: {
    index: './src/views/home/index.pug',
  },

  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
        options: {
          method: 'render',
        },
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|ico|svg|woff2)/, // filter for both images and fonts
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            const { dir } = path.parse(pathData.filename);
            const outputPath = dir.replace('src/', '');
            return outputPath + '/[name].[hash:8][ext]';
          },
        },
      },
    ],
  },
};