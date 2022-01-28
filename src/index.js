const vm = require('vm');
const path = require('path');
const ansis = require('ansis');
const { merge } = require('webpack-merge');
const { plugin, isWin } = require('./config');
const { isFunction, resource, pathToPosix } = require('./utils');
const { extractHtml, extractCss } = require('./modules');

const {
  optionModulesException,
  publicPathException,
  executeTemplateFunctionException,
  postprocessException,
} = require('./exceptions');

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
 * @property {function(string, EntryAssetInfo, Compilation): string | null} [postprocess = null] The post process for extracted content from entry.
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
 * @property {string | function(PathData, AssetInfo): string} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only this substitutions: [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 * @property {string} importFile
 * @property {string} outputPath
 * @property {string} sourcePath
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {function(string, AssetInfo, Compilation): string} [postprocess = null] The post process for extracted content from entry.
 * @property {Array} resources
 * @property {boolean} [verbose = false] Show an information by handles of the entry in a postprocess.
 */

/**
 * @typedef {Object} EntryAssetInfo
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {string} entryFile The entry file.
 * @property {string | (function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The source file.
 * @property {string} assetFile The output asset file with relative path by webpack output path.
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

  // each entry has its own local options that override global options
  modules: [],
};

class PugPlugin {
  /** @type {AssetEntry[]} */
  entries = [];

  /**
   * Resources required in the template.
   * @type {[]}
   */
  entryAssets = [];

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

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }
  }

  apply(compiler) {
    if (!this.enabled) return;

    const webpackOutputPath = compiler.options.output.path;
    const webpackOutputPublicPath = compiler.options.output.publicPath;
    const { RawSource } = compiler.webpack.sources;

    // TODO resolve 'auto' publicPath
    if (webpackOutputPublicPath == null || webpackOutputPublicPath === 'auto') publicPathException();
    resource.publicPath = webpackOutputPublicPath;

    // enable library type `jsonp` for compilation JS from source into HTML string via Function()
    if (compiler.options.output.enabledLibraryTypes.indexOf('jsonp') < 0) {
      compiler.options.output.enabledLibraryTypes.push('jsonp');
    }

    compiler.hooks.entryOption.tap(plugin, (context, entries) => {
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
        const importFile = entry.import[0];
        let sourceFile = this.getFileFromImport(importFile);
        const module = this.getModule(sourceFile);

        if (!extensionRegexp.test(sourceFile) && !module) continue;
        if (!entry.library) entry.library = this.entryLibrary;

        if (module) {
          if (module.hasOwnProperty('verbose')) verbose = module.verbose;
          if (module.filename) filenameTemplate = module.filename;
          if (module.sourcePath) sourcePath = module.sourcePath;
          if (module.outputPath) outputPath = module.outputPath;
          if (module.postprocess) postprocess = module.postprocess;
        }

        if (!path.isAbsolute(sourceFile)) {
          sourceFile = path.join(sourcePath, sourceFile);
          entry.import[0] = path.join(sourcePath, importFile);
        }

        if (entry.filename) filenameTemplate = entry.filename;

        /** @type {AssetEntry} */
        const assetEntry = {
          name: name,
          filenameTemplate: filenameTemplate,
          filename: undefined,
          file: undefined,
          assetFile: undefined,
          importFile: sourceFile,
          sourcePath: sourcePath,
          outputPath: outputPath,
          library: entry.library,
          postprocess: isFunction(postprocess) ? postprocess : null,
          verbose,
        };

        entry.filename = (pathData, assetInfo) => {
          // define lazy memoized getter for the property `filename`, it will be generated later
          if (!assetEntry.filename) {
            Object.defineProperty(assetEntry, 'filename', {
              get() {
                const filename = pathData.chunk.files.values().next().value;
                this.file = path.join(this.outputPath, filename);
                this.assetFile = path.relative(webpackOutputPath, this.file);
                delete this.filename;

                return (this.filename = filename);
              },
            });
          }

          return isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
        };

        this.entries.push(assetEntry);
      }
    });

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      const verbose = this.verbose;

      // render source code
      compilation.hooks.renderManifest.tap(plugin, (result, { chunk }) => {
        const { chunkGraph } = compilation;
        const { HotUpdateChunk } = compiler.webpack;
        const filenameTemplate = chunk.filenameTemplate;
        let compiledResult = '',
          source;

        // don't hot update chunks
        if (chunk instanceof HotUpdateChunk) return;

        const entry = this.getEntryByName(chunk.name);
        // process only entries supported by this plugin
        if (!entry) return;

        resource.files = {};
        for (const module of chunkGraph.getChunkModules(chunk)) {
          if (this.isEntryModule(module) && chunkGraph.isEntryModuleInChunk(module, chunk)) {
            source = module.originalSource().source().toString();
          } else if (module.type === 'asset/resource') {
            const sourceFile = isWin ? pathToPosix(module.resource) : module.resource;
            const assetFile = module.buildInfo.filename;
            resource.files[sourceFile] = assetFile;
            this.entryAssets.push({
              entryFile: entry.importFile,
              sourceFile,
              assetFile,
            });
          }
        }

        if (source) {
          // note: by any error in webpack config the source is empty
          compiledResult = this.extract(source, entry.importFile);
        }

        result.push({
          render: () => new RawSource(compiledResult),
          filenameTemplate,
          pathOptions: { chunk, contentHashType: 'javascript' },
          identifier: `${plugin}.${chunk.id}`,
          hash: chunk.contentHash['javascript'],
        });
      });

      // compilation.hooks.chunkAsset.tap(plugin, (chunk, filename) => {
      //   // TODO for next release
      //   //  - collect entry files for manifest to replace original name with hashed
      //   const asset = compilation.getAsset(filename);
      //   const assetInfo = compilation.assetsInfo.get(filename) || {};
      // });

      // only here can be an asset deleted or emitted
      compilation.hooks.processAssets.tap(
        {
          name: plugin,
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (assets) => {
          /** @type {null|string|object|function} result */
          let filename;

          for (filename in assets) {
            const entry = this.getEntryByFilename(filename);
            let entryAsset, module, assetFile, source, result, postprocess;

            if (entry) {
              // the asset defined in webpack entry
              if (verbose) this.verboseEntry(entry);
              assetFile = entry.assetFile;
              postprocess = entry.postprocess;
              // the result of rendering in the `renderManifest` hook
              result = assets[filename].source();
            } else {
              // the asset required in pug
              module = this.getModule(filename);
              if (!module) continue;

              // extract required resource which is not presents in webpack entry
              entryAsset = this.entryAssets.find((item) => item.assetFile === filename);
              if (!entryAsset) {
                // remove double assets from webpack entry processed via `asset/resource`
                compilation.deleteAsset(filename);
                continue;
              }

              postprocess = module.postprocess;
              assetFile = filename;
              source = assets[filename].source().toString();

              if (verbose) {
                entryAsset.assetFile = path.join(webpackOutputPath, assetFile);
                this.verboseExtractAsset(entryAsset);
              }
              result = this.extract(source, entryAsset.sourceFile);
            }

            const info = {
              isEntry: !!entry,
              verbose: entry ? entry.verbose : module.verbose,
              entryFile: entry ? entry.file : entryAsset.entryFile,
              filename: entry ? entry.filenameTemplate : module.filename,
              sourceFile: entry ? entry.importFile : entryAsset.sourceFile,
              assetFile,
            };

            if (postprocess) {
              try {
                result = postprocess(result, info, compilation);
              } catch (error) {
                postprocessException(error, info);
              }
            }

            if (result != null) {
              // remove source asset to avoid creating needles js files
              compilation.deleteAsset(filename);
              compilation.emitAsset(assetFile, new RawSource(result, false));
            }
          }
        }
      );
    });
  }

  /**
   * Extract the content from source generated by loaders such as `css-loader`, `html-loader`.
   *
   * @param {string} source The source generated by `css-loader`.
   * @param {string} sourceFile The full path of source file.
   * @returns {string}
   */
  extract(source, sourceFile) {
    resource.context = path.dirname(sourceFile);
    source = this.toCommonJS(source);

    let result;
    const contextObject = vm.createContext({
      require: resource.require,
      // the `module.id` is required for `css-loader`
      module: { id: sourceFile },
    });

    const script = new vm.Script(source, { filename: sourceFile });
    result = script.runInContext(contextObject) || '';

    if (isFunction(result)) {
      try {
        return result();
      } catch (error) {
        executeTemplateFunctionException(error, sourceFile, source);
      }
    }

    // generated result of the `css-loader` has the own method `toString()` to concatenate code strings
    // see node_modules/css-loader/dist/runtime/sourceMaps.js
    return result.toString();
  }

  /**
   * Transform source of a module to the CommonJS module.
   * @param {string} source
   * @returns {string}
   */
  toCommonJS(source) {
    if (source.indexOf('export default') >= 0) {
      // import to require
      const importMatches = source.matchAll(/import (.+) from "(.+)";/g);
      for (const [match, variable, file] of importMatches) {
        source = source.replace(match, `var ${variable} = require('${file}');`);
      }
      // new URL to require
      const urlMatches = source.matchAll(/= new URL\("(.+?)"(?:.*?)\);/g);
      for (const [match, file] of urlMatches) {
        source = source.replace(match, `= require('${file}');`);
      }

      // TODO: implement clever method to replace module `export default`, but not in any string, e.g.:
      //   - export default '<h1>Code example: `var code = "hello";export default code;` </h1>';

      // cases:
      //   export default '<h1>Hello World!</h1>';
      //   var code = '<h1>Hello World!</h1>';export default code;
      source = source.replace(/export default (.+);/, 'module.exports = $1;');
    }

    return source;
  }

  /**
   * Return the file part from import file.
   * For example: from `index.pug?data={"key":"value"}` return `index.pug`
   *
   * @param {string} str
   * @returns {string}
   */
  getFileFromImport(str) {
    return str.split('?', 1)[0];
  }

  /**
   * @param {string} name The entry name.
   * @returns {AssetEntry}
   */
  getEntryByName(name) {
    return this.entries.find((entry) => entry.name === name);
  }

  /**
   * @param {string} filename The filename is a key of the compilation assets object.
   * @return {AssetEntry}
   */
  getEntryByFilename(filename) {
    return this.entries.find((entry) => entry.filename === this.getFileFromImport(filename));
  }

  /**
   * @param {string} filename The filename of a source file, can contain a query string.
   * @returns {ModuleOptions}
   */
  getModule(filename) {
    return this.options.modules.find(
      (module) => module.enabled !== false && module.test.test(this.getFileFromImport(filename))
    );
  }

  /**
   * @param {Module} module The chunk module.
   * @returns {boolean}
   */
  isEntryModule(module) {
    const importFile = module.resource;

    return importFile
      ? this.entries.find((entry) => entry.importFile === this.getFileFromImport(importFile)) !== undefined
      : false;
  }

  /**
   * @param {AssetEntry} entry
   */
  verboseEntry(entry) {
    if (!entry) return;
    if (!this.hasVerboseOut) console.log('\n');
    this.hasVerboseOut = true;
    console.log(
      `${ansis.black.bgYellow(`[${plugin}]`)} Compile the entry ${ansis.green(entry.name)}\n` +
        ` - filename: ${
          isFunction(entry.filenameTemplate)
            ? ansis.greenBright('[Function: filename]')
            : ansis.magenta(entry.filenameTemplate.toString())
        }\n` +
        ` - source: ${ansis.cyan(entry.importFile)}\n` +
        ` - output: ${ansis.cyanBright(entry.file)}\n`
    );
  }

  /**
   * @param {string} entryFile
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  verboseExtractAsset({ entryFile, sourceFile, assetFile }) {
    if (!this.hasVerboseOut) console.log('\n');
    this.hasVerboseOut = true;
    console.log(
      `${ansis.black.bgYellow(`[${plugin}]`)} Extract the asset from ${ansis.green(entryFile)}\n` +
        ` - source: ${ansis.cyan(sourceFile)}\n` +
        ` - output: ${ansis.cyanBright(assetFile)}\n`
    );
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
