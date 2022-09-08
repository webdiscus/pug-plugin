const path = require('path');
const PugPlugin = require('../../../');

const sourcePath = path.join(__dirname, 'src'); // => /absolute/path/to/src
const keepPugFolderStructure = (pathData) => {
  const sourceFile = pathData.filename; // => /absolute/path/to/src/pages/about.pug
  const relativeFile = path.relative(sourcePath, sourceFile); // => pages/about.pug
  const { dir, name } = path.parse(relativeFile); // dir: 'pages', name: 'about'
  return `${dir}/${name}.html`; // => dist/pages/about.html
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public/'),
  },

  entry: {
    // note: each key of entry must be unique,
    // the output filename will be generated by source filename via the keepPugFolderStructure()
    page001: './src/index.pug', // => dist/index.html
    page002: './src/pages/about.pug', // => dist/pages/about.html
    page003: './src/pages/contact/index.pug', // => dist/pages/contact/index.html
  },

  plugins: [
    new PugPlugin({
      // use the function to dynamic generate output filenames for all Pug files defined in the entry
      filename: keepPugFolderStructure,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(pug)$/,
        loader: PugPlugin.loader,
      },
    ],
  },
};