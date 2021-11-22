const path = require('path');
const PugPlugin = require('../../../');

const basePath = path.resolve(__dirname);
const templatePath = path.join(basePath, 'src/templates/');
const htmlPath = path.join(basePath, 'public/help/');

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
    // test the option `sourcePath` to resolve the import filename
    index: 'index.pug',
    // test an absolute path for import
    about: path.join(templatePath, 'about.pug'),
    // test the option `outputPath` to resolve the output filename
    'pages/page01': {
      import: 'pages/page01.pug',
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
          filename: 'assets/images/[hash][ext]',
        },
      },
    ],
  },
};