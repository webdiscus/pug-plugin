const path = require('path');
const PugPlugin = require('../../../');

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
    // test default value of the option `sourcePath` to resolve the import filename
    index: './src/views/index.pug',
    // test an absolute path for import
    about: path.join(__dirname, 'src/views/about.pug'),
    // test default value of the option `outputPath` to resolve the output filename
    contact: {
      import: './src/views/pages/contact.pug',
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
