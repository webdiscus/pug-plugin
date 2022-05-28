const path = require('path');
const ansis = require('ansis');
const { plugin } = require('./config');
const { outToConsole } = require('./utils');

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
    sourcePath: undefined,
    outputPath: undefined,
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
    //postprocess(content, info, compilation) {
    //  if (this.verbose) console.log(`Extract HTML: ${info.outputFile}\n`);
    //  return content;
    //},
  };

  this.options = { ...this.options, ...options };

  return this.options;
};

/**
 * The plugin module to extract the css and source map from asset.
 * @note If the webpack.mode is `production` then `css-loader` minify the css self,
 *   if is `development` then css is pretty formatted.
 *
 * TODO:
 *   - add supports a chunk name template with [id]
 *   - add supports multiple entries, https://github.com/webpack-contrib/mini-css-extract-plugin/blob/master/test/cases/at-import-in-the-entry/webpack.config.js
 *   - add option `chunkFilename` https://webpack.js.org/configuration/output/#outputchunkfilename
 *
 * @param {ModuleOptions} options The custom options.
 * @return {ModuleOptions} Default options merged with custom options.
 */
const extractCss = function (options = {}) {
  this.options = {
    test: /\.(css|scss|sass|less|styl)$/,
    enabled: true,
    verbose: false,
    sourcePath: undefined,
    outputPath: undefined,
    filename: '[name].css',

    /**
     * Extract CSS and source map.
     *
     * @note The @import handling in CSS is not supported, e.g.: @import 'assets/css/style.css'.
     *    Disable @import at-rules handling in `css-loader`:
     *    {
     *      test: /\.(css|scss)$/i,
     *      use: [
     *        {
     *          loader: 'css-loader'
     *          options: {
     *            import: false, // disable @import at-rules handling
     *          },
     *        },
     *        'sass-loader',
     *      ],
     *    },
     *
     * @param {array} sourceMaps
     * @param {string} assetFile
     * @param {Compilation} compilation
     * @returns {string}
     * @private
     */
    extract(sourceMaps, assetFile, compilation) {
      const { compiler } = compilation;
      const { RawSource, ConcatSource } = compiler.webpack.sources;
      const { devtool } = compiler.options;
      const isInlineSourceMap = devtool && devtool.startsWith('inline-');
      const concatMapping = new ConcatSource();

      let contentCSS = '';
      let contentMapping = '';
      let hasMapping = false;
      let mapFile;
      let file = '';

      for (const item of sourceMaps) {
        if (!Array.isArray(item)) continue;

        const [sourceFile, content, media, sourceMap, supports, layer] = item;

        if (contentCSS) contentCSS += '\n';

        // the case in scss: @import url('./style.css');
        // `sourceFile` is null and `content` contains the output CSS filename
        if (sourceFile == null && content.endsWith('.css')) {
          contentCSS += `@import url(${content});`;
          continue;
        }

        contentCSS += content;

        if (sourceMap) {
          if (isInlineSourceMap) {
            const sourceURLs = sourceMap.sources
              .map((source) => '/*# sourceURL=' + (sourceMap.sourceRoot || '') + source + ' */')
              .join('\n');
            const base64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
            contentMapping +=
              '\n' + sourceURLs + '\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64 + ' */';
          } else {
            concatMapping.add(new RawSource(JSON.stringify(sourceMap)));
          }
          hasMapping = true;
        }

        if (!file && sourceFile) file = sourceFile;
      }

      if (hasMapping) {
        if (isInlineSourceMap) {
          contentCSS += contentMapping;
        } else {
          mapFile = assetFile + '.map';
          contentCSS += `\n/*# sourceMappingURL=${path.basename(mapFile)} */`;
          compilation.emitAsset(mapFile, concatMapping);
        }
      }

      if (this.verbose) {
        let verbose =
          ansis.black.bgGreen(`[${plugin}]`) +
          ansis.black.bgWhite(` Extract CSS `) +
          ' in ' +
          ansis.cyan(file) +
          `\n` +
          ` - ${ansis.magenta(assetFile)}\n`;
        if (mapFile) verbose += ` - ${ansis.magenta(mapFile)}\n`;
        outToConsole(verbose);
      }

      return contentCSS;
    },

    /**
     * The post process for extracted CSS content.
     * This method can be overridden in module options.
     *
     * @note The content is readonly!
     *   The CSS content should don't be change, because it has already the compiled source map.
     *
     * @param {string} content The css content generated by css-loader.
     * @param {ResourceInfo} info
     * @param {Compilation} compilation
     * @return {string | null}
     */
    // postprocess(content, info, compilation) {
    //   // the content here should be readonly
    //   if (this.verbose) {
    //     console.log(info);
    //   }
    //   return content;
    // },
  };

  this.options = { ...this.options, ...options };

  return this.options;
};

module.exports = {
  extractHtml,
  extractCss,
};
