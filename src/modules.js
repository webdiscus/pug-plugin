const path = require('path');
const { merge } = require('webpack-merge');
const { plugin } = require('./utils');
const colstr = require('./color-string');

/**
 * The lightweight plugin module to extract and save the HTML file.
 *
 * Note: you can use this module as boilerplate for your own custom module.
 *
 * @param {ModuleOptions} options The custom options.
 * @return {ModuleOptions} Default options merged with custom options.
 */
const extractHtml = (options = {}) => {
  const defaultOptions = {
    test: /\.(html)$/,
    enabled: true,
    verbose: false,
    sourcePath: undefined,
    outputPath: undefined,
    filename: '[name].html',
    // example of filename as the function
    //filename: (pathData, assetInfo) => {
    //  const name = pathData.chunk.name;
    //  return name === 'main' ? 'index.html' : '[name].html';
    //},

    /**
     * @param {string} content
     * @param {AssetEntry} entry
     * @param {Compilation} compilation
     * @return {string | null}
     */
    //postprocess: (content, entry, compilation) => {
    //  // todo For example, pretty format the content of html.
    //  if (entry.verbose) console.log(`Extract HTML: ${entry.file}\n`);
    //  return content;
    //},
  };

  return merge(defaultOptions, options);
};

/**
 * The lightweight plugin module to extract the css and source map from asset content.
 * todo test cases:
 *   - add supports a chunk name template with [id]
 *   - https://github.com/webpack-contrib/mini-css-extract-plugin/tree/master/test/manual/src
 *   - multiple entries, https://github.com/webpack-contrib/mini-css-extract-plugin/blob/master/test/cases/at-import-in-the-entry/webpack.config.js
 *
 * @param {ModuleOptions} options The custom options.
 * @return {ModuleOptions} Default options merged with custom options.
 */
const extractCss = (options = {}) => {
  const defaultOptions = {
    test: /\.(css|sass|scss)$/,
    enabled: true,
    verbose: false,
    sourcePath: undefined,
    outputPath: undefined,
    filename: '[name].css',

    /**
     * @param {array} content The result from css-loader.
     * @param {AssetEntry} entry
     * @param {Compilation} compilation
     * @return {string | null}
     */
    postprocess: (content, entry, compilation) => {
      const [item] = content;
      const [sourceFile, source, nop, sourceMap] = item;
      let sourceMappingURL = '';

      if (entry.verbose)
        console.log(
          colstr.bgYellow(`[${plugin}]`, colstr.colors.black) +
            colstr.bgGreen(` Extract CSS `, colstr.colors.black) +
            colstr.cyan(' ' + entry.file)
        );

      // add css source map for development mode
      if (compilation.options.devtool) {
        const rawSourceMap = new entry.RawSource(JSON.stringify(sourceMap));
        const mapFile = entry.assetFile + '.map';

        compilation.emitAsset(mapFile, rawSourceMap);
        sourceMappingURL = `\n/*# sourceMappingURL=${path.basename(mapFile)} */`;
      }

      return source + sourceMappingURL;
    },
  };

  return merge(defaultOptions, options);
};

module.exports = {
  extractHtml,
  extractCss,
};
