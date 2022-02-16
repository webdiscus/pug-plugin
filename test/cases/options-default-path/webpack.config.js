const path = require('path');
const PugPlugin = require('../../../');

const basePath = path.resolve(__dirname);
const sourcePath = path.join(basePath, 'src/');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(basePath, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'public/'),
    publicPath: '/',
  },

  entry: {
    // test default value of the option `sourcePath` to resolve the import filename
    index: './src/templates/index.pug',
    // test an absolute path for import
    about: path.join(sourcePath, 'templates/about.pug'),
    // test default value of the option `outputPath` to resolve the output filename
    page01: {
      import: './src/templates/pages/page01.pug',
      filename: 'pages/[name].html',
    },
  },

  plugins: [
    // zero config
    new PugPlugin(),
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
        test: /\.(png|jpg|jpeg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};