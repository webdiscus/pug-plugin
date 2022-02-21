const vm = require('vm');
const path = require('path');
const ansis = require('ansis');
const { merge } = require('webpack-merge');
const { plugin, isWin } = require('./config');
const { extractHtml, extractCss } = require('./modules');
const { urlDependencyResolver, resourceResolver } = require('./resolver');
const { isFunction, pathToPosix, outToConsole } = require('./utils');
const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

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
 * @property {function(string, ResourceInfo, Compilation): string | null =} postprocess The post process for extracted content from entry.
 * @property {function(): string | null =} extract
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
 * @property {function(): string | null =} extract
 * @property {Array} resources
 * @property {boolean} [verbose = false] Show an information by handles of the entry in a postprocess.
 */

/**
 * @typedef {Object} ResourceInfo
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {string} outputFile The absolute path to generated output file (issuer of asset).
 * @property {string | (function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} assetFile The output asset file relative by `output.publicPath`.
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

  entryLibrary = {
    name: 'return',
    type: 'jsonp',
  };

  /**
   * @param {PugPluginOptions|{}} options
   */
  constructor(options = {}) {
    this.apply = this.apply.bind(this);
    this.options = merge(defaultOptions, options);
    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }
    resourceResolver.clearCache();
  }

  apply(compiler) {
    if (!this.enabled) return;

    const webpackOptions = compiler.options;
    const { path: webpackOutputPath, publicPath: webpackOutputPublicPath } = webpackOptions.output;
    const { RawSource } = compiler.webpack.sources;
    const { HotUpdateChunk } = compiler.webpack;

    // TODO: resolveInPaths 'auto' publicPath
    if (webpackOutputPublicPath == null || webpackOutputPublicPath === 'auto') publicPathException();

    resourceResolver.init({
      publicPath: webpackOutputPublicPath,
    });

    // enable library type `jsonp` for compilation JS from source into HTML string via Function()
    if (webpackOptions.output.enabledLibraryTypes.indexOf('jsonp') < 0) {
      webpackOptions.output.enabledLibraryTypes.push('jsonp');
    }

    // Normal Module Factory
    compiler.hooks.normalModuleFactory.tap(plugin, (normalModuleFactory) => {
      urlDependencyResolver.init(normalModuleFactory.fs.fileSystem);

      // TODO: resolveInPaths directory for case like: require('@images/' + file)
      normalModuleFactory.hooks.beforeResolve.tap(plugin, (resolveData) => {
        if (resolveData.dependencyType === 'url') {
          //console.log(' ---> ', resolveData.request);
          urlDependencyResolver.resolve(resolveData);
        }
      });

      normalModuleFactory.hooks.createModule.tap(plugin, (createData, resolveData) => {
        const { context, rawRequest, resource } = createData;
        if (rawRequest !== resource) {
          resourceResolver.addResolvedFile(context, rawRequest, resource);
        }
      });

      // TODO: The snipped is reserved for future features.
      // Context Module Factory
      // compiler.hooks.contextModuleFactory.tap(plugin, (contextModuleFactory) => {
      //   contextModuleFactory.hooks.beforeResolve.tap(plugin, (data) => {
      //     const context = data.context;
      //     //console.log('\n/// Context afterResolve: ', data);
      //     for (let item of data.dependencies) {
      //       if (item.userRequest === '@images2') {
      //       }
      //     }
      //     //return false;
      //   });
      // });
      // Parse source of template function for require() to resolveInPaths unresolved aliases
      // normalModuleFactory.hooks.parser.for('javascript/auto').tap(plugin, (parser, options) => {
      //   parser.hooks.call.for('require').tap(plugin, (expression) => {
      //     // here is unresolved alias, we can manually resolveInPaths it, but we can't change it
      //     console.log('\n... Module parser: ', expression.arguments[0].left.value);
      //     return expression;
      //   });
      // });
    });

    // Entry options
    compiler.hooks.entryOption.tap(plugin, (context, entries) => {
      if (!this.options.sourcePath) this.options.sourcePath = webpackOptions.context;
      if (!this.options.outputPath) this.options.outputPath = webpackOutputPath;

      for (let name in entries) {
        const entry = entries[name];
        let {
          test: extensionRegexp,
          filename: filenameTemplate,
          sourcePath,
          outputPath,
          postprocess,
          extract,
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
          if (module.extract) extract = module.extract;
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
          importFile: sourceFile,
          sourcePath: sourcePath,
          outputPath: outputPath,
          library: entry.library,
          postprocess: isFunction(postprocess) ? postprocess : null,
          extract: isFunction(extract) ? extract : null,
          verbose,
        };

        const relativeOutputPath = path.relative(webpackOutputPath, outputPath);

        entry.filename = (pathData, assetInfo) => {
          if (!assetEntry.filename) {
            Object.defineProperty(assetEntry, 'filename', {
              set(filename) {
                // replace the setter with value of resolved filename
                delete this.filename;
                this.filename = filename;
                this.file = path.join(webpackOutputPath, filename);
              },
            });
          }

          let filename = isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
          filename = path.posix.join(relativeOutputPath, filename);

          return filename;
        };

        this.entries.push(assetEntry);
      }
    });

    // This compilation
    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      const verbose = this.verbose;
      this.compilation = compilation;

      compilation.hooks.buildModule.tap(plugin, (module) => {
        if (module.type === 'asset/resource') {
          // fix css module, if `html` method is used, to be able to extract css from source code
          const isCss = module.loaders.find((item) => item.loader.indexOf('css-loader') > 0);
          if (isCss) {
            module.type = 'javascript/auto';
            module.binary = false;
            module.parser = new JavascriptParser('auto');
            module.generator = new JavascriptGenerator();
          }
        }
      });

      // render source code
      compilation.hooks.renderManifest.tap(
        plugin,
        (result, { chunk, chunkGraph, moduleGraph, codeGenerationResults }) => {
          if (chunk instanceof HotUpdateChunk) return;

          const entry = this.getEntryByName(chunk.name);

          // process only entries supported by this plugin
          if (!entry) return;

          const sources = new Set();
          const contentHashType = 'javascript';
          let assetFile = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });

          entry.filename = assetFile;
          resourceResolver.clearChunkCache();

          if (verbose) this.verboseEntry(entry);

          for (const module of chunkGraph.getChunkModules(chunk)) {
            if (!module.resource) continue;

            const { buildInfo } = module;
            const resourceResolveDataContext = module.resourceResolveData.context || {};
            const issuerFile = resourceResolveDataContext.issuer || module.resource;

            if (this.isEntryModule(module) && chunkGraph.isEntryModuleInChunk(module, chunk)) {
              // entry-point
              const source = module.originalSource();
              // module builder error
              if (source == null) return;

              const pluginModule = this.getModule(module.resource) || entry;

              const postprocessInfo = {
                isEntry: true,
                verbose: entry.verbose,
                filename: chunk.filenameTemplate,
                sourceFile: entry.importFile,
                outputFile: entry.file,
                assetFile,
              };

              sources.add({
                isEntry: true,
                // compiler arguments
                source: source.source().toString(),
                sourceFile: entry.importFile,
                assetFile,
                pluginModule,
                // result options
                postprocessInfo,
                identifier: `${plugin}.${chunk.id}`,
                pathOptions: { chunk, contentHashType },
                hash: chunk.contentHash[contentHashType],
                filenameTemplate: chunk.filenameTemplate,
              });
            } else if (module.type === 'javascript/auto') {
              // require a resource supported via the plugin module, e.g. style
              const source = module.originalSource();
              // module builder error
              if (source == null) return;

              const pluginModule = this.getModule(module.resource);
              if (!pluginModule) continue;

              const filenameTemplate = pluginModule.filename;

              // TODO: generate content hash for assets required in pug for true [contenthash] in filename
              //   origin: buildInfo.assetInfo.contenthash or buildInfo.fullContentHash
              const hash = buildInfo.assetInfo ? buildInfo.assetInfo.contenthash : buildInfo.hash;
              const { name } = path.parse(module.resource);
              // TODO: research why sometimes the id is relative path instead of a number, it's ok?
              const id = chunkGraph.getModuleId(module);

              /** @type {PathData} minimum data to generate an asset path by filenameTemplate */
              const contextData = {
                contentHash: hash,
                chunk: {
                  chunkId: chunk.id,
                  id,
                  name,
                  hash,
                },
              };
              const assetFile = compilation.getAssetPath(filenameTemplate, contextData);
              resourceResolver.addToChunkCache(module, assetFile);

              const postprocessInfo = {
                isEntry: false,
                verbose: pluginModule.verbose,
                filename: filenameTemplate,
                sourceFile: module.resource,
                outputFile: entry.file,
                assetFile,
              };

              if (verbose)
                this.verboseExtractModule({
                  issuerFile,
                  sourceFile: module.resource,
                  assetFile: path.join(webpackOutputPath, assetFile),
                });

              sources.add({
                isEntry: false,
                // compiler arguments
                source: source.source().toString(),
                sourceFile: module.resource,
                assetFile,
                pluginModule,
                // result options
                postprocessInfo,
                identifier: `${plugin}.${chunk.id}.${id}`,
                pathOptions: contextData,
                hash,
                filenameTemplate,
              });
            } else if (module.type === 'asset/resource') {
              // require a resource
              const assetFile = buildInfo.filename;
              resourceResolver.addToChunkCache(module, assetFile);

              if (verbose)
                this.verboseExtractResource({
                  issuerFile,
                  sourceFile: module.resource,
                  assetFile: path.join(webpackOutputPath, assetFile),
                });
            }
          }

          for (let item of sources) {
            if (!item.source) continue;
            // note: by any error in webpack config the source is empty
            let compiledResult = this.compileSource(item.source, item.sourceFile, item.assetFile, item.pluginModule);

            if (item.pluginModule.postprocess) {
              try {
                compiledResult = item.pluginModule.postprocess(compiledResult, item.postprocessInfo, compilation);
              } catch (error) {
                postprocessException(error, item.postprocessInfo);
              }
            }

            if (compiledResult != null) {
              result.push({
                render: () => new RawSource(compiledResult),
                filename: item.assetFile,
                pathOptions: item.pathOptions,
                identifier: item.identifier,
                hash: item.hash,
              });
            }
          }
        }
      );

      // only here can be an asset deleted or emitted
      // compilation.hooks.processAssets.tap(
      //   { name: plugin, stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE },
      //   (assets) => {
      //     // do nothing
      //   }
      // );
    });
  }

  /**
   * Compile the source generated by loaders such as `css-loader`, `html-loader`, `pug-loader`.
   *
   * @param {string} source The source generated by `css-loader`.
   * @param {string} sourceFile The full path of source file.
   * @param {string} assetFile
   * @param {ModuleOptions} pluginModule
   * @return {Buffer}
   */
  compileSource(source, sourceFile, assetFile, pluginModule) {
    resourceResolver.setCurrentContext(path.dirname(sourceFile));
    const contextOptions = {
      require: resourceResolver.require,
      // the `module.id` is required for `css-loader`, in module extractCss expected as source path
      module: { id: sourceFile },
    };
    const contextObject = vm.createContext(contextOptions);
    const sourceCjs = this.toCommonJS(source);
    const script = new vm.Script(sourceCjs, { filename: sourceFile });
    let result = script.runInContext(contextObject) || '';

    if (isFunction(result)) {
      try {
        return result();
      } catch (error) {
        executeTemplateFunctionException(error, sourceFile, source);
      }
    }

    if (pluginModule && pluginModule.extract) {
      return pluginModule.extract(result, assetFile, this.compilation);
    }

    return result;
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
    outToConsole(
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
   * @param {string} issuerFile
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  verboseExtractModule({ issuerFile, sourceFile, assetFile }) {
    outToConsole(
      `${ansis.black.bgYellow(`[${plugin}]`) + ansis.black.bgGreen(` Extract Module `)} in ` +
        `${ansis.green(issuerFile)}\n` +
        ` - source: ${ansis.cyan(sourceFile)}\n` +
        ` - output: ${ansis.cyanBright(assetFile)}\n`
    );
  }

  /**
   * @param {string} issuerFile
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  verboseExtractResource({ issuerFile, sourceFile, assetFile }) {
    outToConsole(
      `${ansis.black.bgYellow(`[${plugin}]`) + ansis.black.bgGreen(` Extract Resource `)} in ` +
        `${ansis.green(issuerFile)}\n` +
        ` - source: ${ansis.cyan(sourceFile)}\n` +
        ` - output: ${ansis.cyanBright(assetFile)}\n`
    );
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
//module.exports.loader = require.resolve('../../pug-loader'); // local dev only
