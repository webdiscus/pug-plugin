const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');

const colstr = require('./color-string');
const { plugin, isFunction, shallowEqual } = require('./utils');
const { extractHtml, extractCss } = require('./modules');

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('webpack').PathData} PathData */
/** @typedef {import('webpack').AssetInfo} AssetInfo */
/** @typedef {import('webpack-sources').RawSource} RawSource */

/**
 * @typedef {Object} ModuleOptions
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {RegExp} test The search for a match of entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string | function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 *   See https://webpack.js.org/configuration/output/#outputfilename.
 *   Must be an absolute or a relative by the context path.
 * @property {function(string, AssetEntry, Compilation): string | null} [postprocess = null] The post process for extracted content from entry.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 */

/**
 * @typedef {ModuleOptions} PugPluginOptions
 * @property {ModuleOptions[]} modules
 */

/**
 * @typedef {Object} AssetEntry
 * @property {string} name The key of webpack entry.
 * @property {string} file The output asset file with absolute path.
 * @property {string} assetFile The output asset file with relative path by webpack output path.
 *   Note: the method compilation.emitAsset() use this file as key of assets object
 *   and save the file relative by output path, defined in webpack.options.output.path.
 * @property {string | function(PathData, AssetInfo): string} filenameTemplate The filename template.
 * @property {string} filename The asset filename.
 *  The template strings support only this substitutions: [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 * @property {string} import
 * @property {string} outputPath
 * @property {string} sourcePath
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {function(string, AssetEntry, Compilation): string} [postprocess = null] The post process for extracted content from entry.
 * @property {boolean} [verbose = false] Show an information by handles of the entry in a postprocess.
 * @property {RawSource} RawSource The reference of the class compiler.webpack.sources.RawSource.
 */

/**
 * @var {PugPluginOptions} defaultOptions
 */
const defaultOptions = {
  test: /\.(pug)$/,
  enabled: true,
  verbose: false,
  sourcePath: null,
  outputPath: null,
  filename: '[name].html',
  postprocess: null,

  // experimental, reserved feature for the future: each entry has its own local options that override global options
  modules: [],
};

class PugPlugin {
  /** @type {AssetEntry[]} */
  entries = [];

  entryLibrary = {
    name: 'return',
    type: 'jsonp',
  };

  /**
   * @param {PugPluginOptions} options
   */
  constructor(options = {}) {
    this.apply = this.apply.bind(this);
    this.options = merge(defaultOptions, options);
    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose;
  }

  /**
   * Get the entry by filename.
   *
   * @param {string} filename The filename is a key of the compilation assets object.
   * @return {AssetEntry}
   */
  getEntry(filename) {
    return this.entries.find((entry) => entry.filename === filename);
  }

  apply(compiler) {
    if (!this.enabled) return;

    // enable library type `jsonp` for compilation JS from source into HTML string via Function()
    if (compiler.options.output.enabledLibraryTypes.indexOf('jsonp') < 0) {
      compiler.options.output.enabledLibraryTypes.push('jsonp');
    }

    compiler.hooks.entryOption.tap(plugin, (context, entries) => {
      const webpackOutputPath = compiler.options.output.path;

      if (!this.options.sourcePath) this.options.sourcePath = compiler.options.context;
      if (!this.options.outputPath) this.options.outputPath = webpackOutputPath;

      for (let name in entries) {
        const entry = entries[name];
        let {
          test: extensionRegexp,
          filename: filenameTemplate,
          sourcePath,
          outputPath,
          postprocess,
          verbose,
        } = this.options;
        let sourceFile = entry.import[0];
        const module = this.options.modules.find((module) => module.enabled !== false && module.test.test(sourceFile));

        if (!extensionRegexp.test(sourceFile) && !module) continue;

        if (!entry.library) entry.library = this.entryLibrary;

        if (module) {
          if (module.hasOwnProperty('verbose')) verbose = module.verbose;
          if (module.filename) filenameTemplate = module.filename;
          if (module.sourcePath) sourcePath = module.sourcePath;
          if (module.outputPath) outputPath = module.outputPath;
          if (module.postprocess) postprocess = module.postprocess;
        }

        if (!sourceFile.startsWith('/')) {
          sourceFile = path.join(sourcePath, sourceFile);
          entry.import[0] = sourceFile;
        }

        if (entry.filename) filenameTemplate = entry.filename;

        /** @type {AssetEntry} */
        const assetEntry = {
          name: name,
          filenameTemplate: filenameTemplate,
          filename: undefined,
          file: undefined,
          assetFile: undefined,
          import: sourceFile,
          sourcePath: sourcePath,
          outputPath: outputPath,
          library: entry.library,
          postprocess: isFunction(postprocess) ? postprocess : null,
          verbose: verbose,
          RawSource: compiler.webpack.sources.RawSource,
        };

        entry.filename = (pathData, assetInfo) => {
          // define lazy memoized getter for the property `filename`, it will be generated later
          if (!assetEntry.filename)
            Object.defineProperty(assetEntry, 'filename', {
              get() {
                const filename = pathData.chunk.files.values().next().value;
                this.file = path.join(this.outputPath, filename);
                this.assetFile = path.relative(webpackOutputPath, this.file);
                delete this.filename;
                return (this.filename = filename);
              },
            });

          return isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
        };

        this.entries.push(assetEntry);
      }
    });

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      let { verbose } = this.options;

      // todo resolve 'auto' publicPath
      if (compilation.outputOptions.publicPath === 'auto') this.publicPathException();

      compilation.hooks.processAssets.tap(
        {
          name: plugin,
          // run this process before all others
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL - 1000,
        },
        (assets) => {
          let filename, result;

          for (filename in assets) {
            const entry = this.getEntry(filename);

            if (!entry) continue;
            if (verbose) this.verboseEntry(entry);

            const source = assets[filename].source();
            // generates the html string from source code
            result = new Function('', source)();
            if (result == null) this.entryException(entry);

            // detect result of ES module
            if (result.default) result = result.default;

            if (isFunction(result)) {
              try {
                // pug-loader.method: compile
                // note: all external variables are already assigned to locals in the template function via pug-loader,
                // the argument must be empty object to avoid error by reading property from undefined
                result = result({});
              } catch (error) {
                this.executeAssetSourceException(error, entry);
              }
            }

            if (entry.postprocess) {
              try {
                result = entry.postprocess(result, entry, compilation);
              } catch (error) {
                this.postprocessException(error, entry);
              }
            }

            if (result != null) {
              // remove source asset to avoid creating needles js files
              compilation.deleteAsset(filename);
              compilation.emitAsset(entry.assetFile, new entry.RawSource(result, false));
            }
          }
        }
      );
    });
  }

  /**
   * @param {AssetEntry} entry
   */
  verboseEntry(entry) {
    if (!this.hasVerboseOut) console.log('\n');
    this.hasVerboseOut = true;
    console.log(
      `[${colstr.yellow(plugin)}] Compile the entry ${colstr.green(entry.name)}\n` +
        ` - filename: ${typeof entry.filename === 'function' ? colstr.cyan('[Function]') : entry.filename}\n` +
        ` - import: ${entry.import}\n` +
        ` - output: ${entry.file}\n`
    );
  }

  publicPathException() {
    throw new Error(
      `\n[${plugin}] This plugin yet not support 'auto' publicPath.\n` +
        `Define a publicPath in the webpack configuration, e.g. output: { publicPath: '/' }.\n`
    );
  }

  /**
   * @param {AssetEntry} entry
   */
  entryException(entry) {
    const existFile = fs.existsSync(entry.import);
    throw new Error(
      `\n[${plugin}] The compiled source from the file "${entry.filename}" is undefined.` +
        '\n' +
        `Possible reasons: \n` +
        (!existFile ? ` - the import file '${entry.import}' is not found\n` : '') +
        (existFile ? ` - the compiled file '${entry.file}' is not executable JavaScript\n` : '') +
        (entry.library && !shallowEqual(entry.library, this.entryLibrary)
          ? ` - the library must be undefined or exact ${JSON.stringify(this.entryLibrary)}, but given ${
              entry.library
            }\n`
          : '') +
        '\n'
    );
  }

  /**
   * @param {Error} error
   * @param {AssetEntry} entry
   */
  executeAssetSourceException(error, entry) {
    throw new Error(
      `\n[${plugin}] Asset source execution failed by the entry '${entry.name}'.\n` +
        `The file '${entry.import}'.\n` +
        error
    );
  }

  /**
   * @param {Error} error
   * @param {AssetEntry} entry
   */
  postprocessException(error, entry) {
    throw new Error(
      `\n[${plugin}] Postprocess execution failed by the entry '${entry.name}'.\n` +
        `The file '${entry.import}'.\n` +
        error
    );
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
