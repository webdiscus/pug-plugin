const path = require('path');
const PugPlugin = require('../../../');

const sourcePath = path.join(__dirname, 'src'); // => /absolute/path/to/src
const keepPugFolderStructure = (pathData) => {
  const sourceFile = pathData.filename; // => /absolute/path/to/src/pages/about.pug
  const relativeFile = path.relative(sourcePath, sourceFile); // => pages/about.pug
  const { dir, name } = path.parse(relativeFile); // dir: 'pages', name: 'about'
  return `${dir}/${name}.html`; // => pages/about.html
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug', // dist/index.html
    'pages/contact/': {
      import: './src/pages/contact/index.pug',
      filename: '[name]/index.html', // dist/pages/contact/index.html
    },

    page: {
      import: './src/pages/about.pug',
      filename: keepPugFolderStructure, // => dist/pages/about.html
    },
  },

  plugins: [new PugPlugin()],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};