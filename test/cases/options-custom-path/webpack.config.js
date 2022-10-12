const path = require('path');
const PugPlugin = require('../../../');

const templatePath = path.join(__dirname, 'src/views/');
const htmlPath = path.join(__dirname, 'dist/help/');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    // test the option `sourcePath` to resolve the import filename
    index: 'index.pug',
    // test an absolute path for import
    about: path.join(templatePath, 'about.pug'),
    // test the option `outputPath` to resolve the output filename
    'pages/home': {
      import: 'pages/home.pug',
      filename: '[name].html',
    },
  },

  plugins: [
    new PugPlugin({
      sourcePath: templatePath, // absolute base path of sources
      outputPath: htmlPath, // absolute output path to html
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
        test: /\.(png|jpg|jpeg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};