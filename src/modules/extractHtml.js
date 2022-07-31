/**
 * The lightweight plugin module to extract and save the HTML file.
 *
 * Note: you can use this module as boilerplate for your own custom module.
 *
 * @param {ModuleOptions} options The custom options.
 * @return {ModuleOptions} Default options merged with custom options.
 */
const extractHtml = function (options = {}) {
  this.options = {
    test: /\.(html)$/,
    enabled: true,
    verbose: false,
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
     * @param {string} content The extracted html.
     * @param {ResourceInfo} info
     * @param {Compilation} compilation
     * @return {string | null}
     */
    // postprocess(content, info, compilation) {
    //   if (this.verbose) {
    //     console.log(info);
    //   }
    //   return content;
    // },
  };

  this.options = { ...this.options, ...options };

  return this.options;
};

module.exports = extractHtml;
