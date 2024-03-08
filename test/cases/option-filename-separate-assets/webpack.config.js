const path = require('path');
const PugPlugin = require('@test/pug-plugin');

const sourceDirname = 'src/';

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/home/index.pug',
  },

  plugins: [
    new PugPlugin({
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [

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
            const outputPath = dir.replace(sourceDirname, '');
            return outputPath + '/[name].[hash:8][ext]';
          },
        },
      },
    ],
  },
};
