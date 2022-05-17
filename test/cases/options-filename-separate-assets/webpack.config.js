const path = require('path');
const PugPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
    filename: 'js/[name].[contenthash:4].js',
  },

  entry: {
    index: './src/pages/home/index.pug',
  },

  plugins: [
    new PugPlugin({
      //verbose: true,
      modules: [
        PugPlugin.extractCss({
          filename: 'css/[name].[contenthash:4].css',
        }),
        // {
        //   test: /\.pug$/,
        //   outputPath: 'pages/',
        // },
      ],
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

var qq = {
  test: /\.(png|jpg|jpeg|ico|svg|woff2)/, // filter for both images and fonts
  type: 'asset/resource',
  generator: {
    filename: (pathData) => {
      const { dir } = path.parse(pathData.filename); // get relative path started with `src/...`
      const outputPath = dir.replace('src/', ''); // remove the source dir from path
      return outputPath + '/[name].[hash:8][ext]'; // return output path with resource filename
    },
  },
};