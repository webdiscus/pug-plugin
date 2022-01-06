const path = require('path');
const ansis = require('ansis');
const { merge } = require('webpack-merge');
const { plugin, isFunction, requireResource } = require('./utils');
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

const MODULE_TYPE = `${plugin}/entry`;

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
      this.optionModulesException(options.modules);
    }
  }

  apply(compiler) {
    if (!this.enabled) return;

    const webpackOutputPath = compiler.options.output.path;
    const webpackOutputPublicPath = compiler.options.output.publicPath;
    const { RawSource } = compiler.webpack.sources;

    // TODO resolve 'auto' publicPath
    if (webpackOutputPublicPath === 'auto') this.publicPathException();
    requireResource.publicPath = webpackOutputPublicPath;

    // enable library type `jsonp` for compilation JS from source into HTML string via Function()
    if (compiler.options.output.enabledLibraryTypes.indexOf('jsonp') < 0) {
      compiler.options.output.enabledLibraryTypes.push('jsonp');
    }

    // TODO prevent warning split chunk 240 KB
    // const { splitChunks } = compiler.options.optimization;
    // if (splitChunks) {
    //   if (splitChunks.defaultSizeTypes.includes('...')) {
    //     splitChunks.defaultSizeTypes.push(MODULE_TYPE);
    //   }
    // }

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
        let sourceFile = entry.import[0];
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

      compilation.hooks.buildModule.tap(plugin, (module) => {
        if (this.isChunkModuleInEntry(module)) {
          module.type = MODULE_TYPE;
        }
      });

      // render source code
      compilation.hooks.renderManifest.tap(plugin, (result, { chunk }) => {
        const { chunkGraph } = compilation;
        const { HotUpdateChunk } = compiler.webpack;
        const filenameTemplate = chunk.filenameTemplate;
        let source = '',
          compiledResult = '';

        // don't hot update chunks
        // TODO research whether the chunk can be the instance of HotUpdateChunk
        if (chunk instanceof HotUpdateChunk) return;

        const entry = this.getEntryByName(chunk.name);

        // process only entries supported by this plugin
        if (!entry) return;

        requireResource.resources = {};
        for (const module of chunkGraph.getChunkModules(chunk)) {
          if (module.type === 'asset/resource') {
            requireResource.resources[module.resource] = module.buildInfo.filename;

            this.entryAssets.push({
              entryFile: entry.importFile,
              sourceFile: module.resource,
              assetFile: module.buildInfo.filename,
            });
          } else if (module.type === MODULE_TYPE) {
            source = module.originalSource().source().toString();
            source = this.getFunctionCode(source);
          }
        }

        if (~source.indexOf('___CSS_LOADER_')) {
          compiledResult = this.extractCss(source, { sourceFile: entry.importFile, moduleId: chunk.id });
        } else {
          compiledResult = this.extractHtml(source, entry);
        }

        result.push({
          render: () => new RawSource(compiledResult),
          filenameTemplate,
          pathOptions: { chunk, contentHashType: 'javascript' },
          identifier: `${plugin}.${chunk.id}`,
          hash: chunk.contentHash['javascript'],
        });
      });

      //
      compilation.hooks.chunkAsset.tap(plugin, (chunk, filename) => {
        // TODO for @next release
        //  - collect entry files for manifest to replace original name with hashed
        //const asset = compilation.getAsset(filename);
        //const assetInfo = compilation.assetsInfo.get(filename) || {};
      });

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
              postprocess = module.postprocess;

              // extract required resource which is not presents in webpack entry
              entryAsset = this.entryAssets.find((item) => item.assetFile === filename);
              if (!entryAsset) {
                // remove double assets from webpack entry processed via `asset/resource`
                compilation.deleteAsset(filename);
                continue;
              }

              assetFile = filename;
              source = assets[filename].source().toString();
              source = this.getFunctionCode(source);

              if (~source.indexOf('___CSS_LOADER_')) {
                const importFile = path.join(webpackOutputPath, filename);
                if (verbose) {
                  entryAsset.assetFile = path.join(webpackOutputPath, assetFile);
                  this.verboseExtractAsset(entryAsset);
                }
                result = this.extractCss(source, { sourceFile: importFile, moduleId: filename });
              }
            }

            const info = {
              isEntry: !!entry,
              entryFile: entry ? entry.file : entryAsset.entryFile,
              filename: entry ? entry.filenameTemplate : module.filename,
              sourceFile: entry ? entry.importFile : entryAsset.sourceFile,
              assetFile,
            };

            if (result == null) {
              this.entryException('The extract from source is undefined.', source, info);
            }

            if (postprocess) {
              try {
                result = postprocess(result, info, compilation);
              } catch (error) {
                this.postprocessException(error, info);
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
   * Extract the html from source code.
   *
   * @param {string} source
   * @param {AssetEntry} entry
   * @returns {string}
   */
  extractHtml(source, entry) {
    let result = new Function('require', source)(requireResource);
    if (isFunction(result)) {
      try {
        return result();
      } catch (error) {
        this.executeAssetSourceException(error, entry);
      }
    }

    return result;
  }

  /**
   * Extract the css and source map from code generated by`css-loader`.
   *
   * @param {string} source The source generated by `css-loader`.
   * @param {string} sourceFile The full path of source file.
   * @param {string} moduleId The id of the css module.
   * @returns {string}
   */
  extractCss(source, { sourceFile, moduleId }) {
    // fix path in `require()` by `css-loader` options: { esModule: false }
    // replace `import from` with `require()` by `css-loader` options: { esModule: true }
    const matches = ~source.indexOf('require(')
      ? source.matchAll(/.+?(\w+) = require\("(.+)"\);/g)
      : source.matchAll(/import (.+) from "(.+)";/g);

    for (const [match, variable, file] of matches) {
      const fullPath = path.join(path.dirname(sourceFile), file);
      const relPath = path.relative(__dirname, fullPath);
      const replace = `var ${variable} = require('${relPath}');`;
      source = source.replace(match, replace);
    }

    // generate the export object of the `css-loader` from source
    // this object has the own method `toString()` for concatenation of all source strings
    // see node_modules/css-loader/dist/runtime/sourceMaps.js
    const result = new Function('require, module', source)(require, { id: moduleId });

    return result.toString();
  }

  /**
   * @param {string} filename The filename is a key of the compilation assets object.
   * @return {AssetEntry}
   */
  getEntryByFilename(filename) {
    return this.entries.find((entry) => entry.filename === filename);
  }

  /**
   * @param {string} name The entry name.
   * @returns {AssetEntry}
   */
  getEntryByName(name) {
    return this.entries.find((entry) => entry.name === name);
  }

  /**
   * @param {string} filename
   * @returns {ModuleOptions}
   */
  getModule(filename) {
    return this.options.modules.find((module) => module.enabled !== false && module.test.test(filename));
  }

  /**
   * @param {Object} module The webpack chunk module.
   * @returns {boolean}
   */
  isChunkModuleInEntry(module) {
    const importFile = module.resource;
    return importFile ? this.entries.find((entry) => entry.importFile === importFile) !== undefined : false;
  }

  /**
   * Transform source of module to function code.
   * @param {string} source
   * @returns {string}
   */
  getFunctionCode(source) {
    if (~source.indexOf('export default')) {
      source = source.replace('export default', `return`);
    } else if (~source.indexOf('module.exports')) {
      source = source.replace(/module.exports\s*=/, `return `);
    }

    return source;
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
          typeof entry.filename === 'function' ? ansis.cyan('[Function]') : ansis.magenta(entry.filenameTemplate)
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

  /**
   * @param {ModuleOptions[]} modules
   * @throws {Error}
   */
  optionModulesException(modules) {
    throw new Error(
      `\n${ansis.black.bgRedBright(`[${plugin}]`)} The plugin option ${ansis.green(
        'modules'
      )} must be the array of ${ansis.green('ModuleOptions')} but given:\n` +
        ansis.cyanBright(JSON.stringify(modules)) +
        `\n`
    );
  }

  /**
   * @throws {Error}
   */
  publicPathException() {
    throw new Error(
      `\n${ansis.black.bgRedBright(`[${plugin}]`)} This plugin yet not support 'auto' publicPath.\n` +
        `Define a publicPath in the webpack configuration, e.g. output: { publicPath: '/' }.\n`
    );
  }

  /**
   * @param {string} errorMessage
   * @param {string} source
   * @param {EntryAssetInfo} info
   * @throws {Error}
   */
  entryException(errorMessage, source, info) {
    let error =
      `\n${ansis.black.bgRedBright(`[${plugin}]`)} Fail by entry file ${ansis.cyan(info.assetFile)}. ` +
      errorMessage +
      '\n' +
      ansis.yellow(`Possible reasons:`) +
      '\n';

    const [unresolvedRequire] = /(<[^>]+require\(.+\).+?>)/.exec(source) || [];
    if (unresolvedRequire) {
      error += ` - the extracted JavaScript contain not resolved ${ansis.cyanBright('require()')}:\n`;
      error += ansis.magenta(unresolvedRequire);
    } else {
      error += ` - the extracted JavaScript is not executable:\n`;
      error += ansis.cyanBright(source);
      error += '\n';
    }

    throw new Error(ansis.white(error) + '\n');
  }

  /**
   * @param {Error} error
   * @param {AssetEntry} entry
   * @throws {Error}
   */
  executeAssetSourceException(error, entry) {
    throw new Error(
      `\n${ansis.black.bgRedBright(`[${plugin}]`)} Asset source execution failed by the entry '${entry.name}'.\n` +
        `The file '${entry.importFile}'.\n` +
        error
    );
  }

  /**
   * @param {Error} error
   * @param {EntryAssetInfo} info
   * @throws {Error}
   */
  postprocessException(error, info) {
    throw new Error(
      `\n${ansis.black.bgRedBright(`[${plugin}]`)} Postprocess execution failed by the entry '${info.entryFile}'.\n` +
        `The source file '${info.sourceFile}'.\n` +
        error
    );
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
