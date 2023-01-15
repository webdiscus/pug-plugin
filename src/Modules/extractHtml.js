/**
 * The lightweight plugin module to extract and save the HTML file from Webpack entry.
 *
 * @note: you can use this module as boilerplate for your own custom module.
 *
 * @type {ModuleOptions}
 */
const extractHtml = {
  test: /\.(html)$/,
  enabled: true,
  verbose: false,
  verboseHeader: 'Extract HTML',
  sourcePath: null,
  outputPath: null,
  filename: '[name].html',
  // example of filename as the function
  // filename(pathData, assetInfo) {
  //   const name = pathData.chunk.name;
  //   return name === 'main' ? 'index.html' : '[name].html';
  // },

  /**
   * The usage example of the postprocess.
   *
   * @param {string} content The extracted html.
   * @param {ResourceInfo} info
   * @param {Compilation} compilation
   * @return {string|null}
   */
  // postprocess(content, info, compilation) {
  //   if (this.verbose) {
  //     console.log(info);
  //   }
  //   return content;
  // },
};

/**
 * @param {ModuleOptions|{}} options The custom options.
 * @return {ModuleOptions} Default options merged with custom options.
 */
module.exports = (options = {}) => ({ ...extractHtml, ...options });
