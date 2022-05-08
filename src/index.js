const vm = require('vm');
const path = require('path');
const url = require('url');
const ansis = require('ansis');
const { merge } = require('webpack-merge');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { plugin } = require('./config');
const { isFunction, parseRequest, outToConsole } = require('./utils');
const { extractHtml, extractCss } = require('./modules');
const ResourceResolver = require('./ResourceResolver');
const UrlDependencyResolver = require('./UrlDependencyResolver');
const Pretty = require('./Pretty');

const AssetEntry = require('./AssetEntry');
const AssetModule = require('./AssetModule');
const AssetScript = require('./AssetScript');

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
 * @property {boolean} [pretty = false] Formatted output of generated HTML.
 */

/**
 * @typedef {ModuleOptions} PugPluginOptions
 * @property {ModuleOptions[]} modules
 */

/**
 * @typedef {Object} AssetEntryOptions
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
  pretty: false,
  sourcePath: null,
  outputPath: null,
  filename: '[name].html',
  // experimental basic supports for inline svg
  inlineAsset: true,
  postprocess: null,
  // reserved
  preprocess(content) {},

  // each entry has its own local options that override global options
  modules: [],
};

/**
 * AssetTrash singleton.
 * Accumulate and remove junk assets from compilation.
 */
const AssetTrash = {
  trash: [],
  /**
   * Add a junk js file to trash.
   *
   * @param {string} file
   */
  toTrash(file) {
    this.trash.push(file);
  },

  /**
   * Remove all js trash files from compilation.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  clearCompilation(compilation) {
    this.trash.forEach((file) => {
      compilation.deleteAsset(file);
    });
    this.reset();
  },

  /**
   * Clear caches before start of this plugin.
   */
  reset() {
    this.trash = [];
  },
};

/**
 * Class PugPlugin.
 */
class PugPlugin {
  entryLibrary = {
    name: 'return',
    type: 'jsonp',
  };

  /**
   * @param {PugPluginOptions|{}} options
   */
  constructor(options = {}) {
    this.options = merge(defaultOptions, options);
    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose === true;
    this.pretty = this.options.pretty === true;
    this.inlineAsset = this.options.inlineAsset === true;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }
    ResourceResolver.clearCache();
  }

  apply(compiler) {
    if (!this.enabled) return;

    const { RawSource } = compiler.webpack.sources;
    const { HotUpdateChunk } = compiler.webpack;
    const JavascriptParser = compiler.webpack.javascript.JavascriptParser;
    const webpackOptions = compiler.options;
    const {
      path: webpackOutputPath,
      publicPath: webpackPublicPath,
      filename: webpackScriptFilename,
    } = webpackOptions.output;

    // TODO: resolveInPaths 'auto' publicPath
    if (webpackPublicPath == null || webpackPublicPath === 'auto') publicPathException();

    ResourceResolver.init({
      publicPath: webpackPublicPath,
    });

    // clear caches by tests, webpack watch or serve
    AssetEntry.clear();
    AssetScript.clear();
    AssetTrash.reset();

    // enable library type `jsonp` for compilation JS from source into HTML string via Function()
    if (webpackOptions.output.enabledLibraryTypes.indexOf('jsonp') < 0) {
      webpackOptions.output.enabledLibraryTypes.push('jsonp');
    }

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
        let { resource: sourceFile } = parseRequest(importFile);
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

        /** @type {AssetEntryOptions} */
        const assetEntryOptions = {
          name,
          filenameTemplate,
          filename: undefined,
          file: undefined,
          importFile: sourceFile,
          sourcePath,
          outputPath,
          library: entry.library,
          postprocess: isFunction(postprocess) ? postprocess : null,
          extract: isFunction(extract) ? extract : null,
          verbose,
        };

        AssetEntry.add(entry, assetEntryOptions, webpackOutputPath);
      }
    });

    // This compilation
    compiler.hooks.thisCompilation.tap(plugin, (compilation, { normalModuleFactory, contextModuleFactory }) => {
      const verbose = this.verbose;
      this.compilation = compilation;

      UrlDependencyResolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        moduleGraph: compilation.moduleGraph,
      });
      AssetEntry.init(compilation);
      AssetTrash.reset();
      AssetScript.reset();
      AssetModule.reset();

      // before resolve
      normalModuleFactory.hooks.beforeResolve.tap(plugin, (resolveData) => {
        const { context, request } = resolveData;

        // ignore data-URL
        if (request.startsWith('data:')) return;

        const importFile = AssetScript.getResource(request);

        if (importFile) {
          const { issuer } = resolveData.contextInfo;
          let name = AssetScript.getUniqueName(importFile, issuer);
          const res = AssetEntry.addToCompilation({
            name,
            importFile,
            filenameTemplate: webpackScriptFilename,
            outputPath: webpackOutputPath,
            context,
            issuer,
          });
          if (!res) return false;

          resolveData.request = importFile;
        } else if (resolveData.dependencyType === 'url') {
          UrlDependencyResolver.resolve(resolveData);
        }
      });

      // after create module
      normalModuleFactory.hooks.module.tap(plugin, (module, createData, resolveData) => {
        const { context, rawRequest, resource } = createData;
        const issuer = resolveData.contextInfo.issuer;

        if (AssetModule.isDataUrl(rawRequest)) return;

        if (module.type === 'asset/inline' || module.type === 'asset') {
          if (AssetModule.hasExt(resource, 'svg') && AssetModule.hasExt(issuer, 'pug')) {
            AssetModule.addInlineSvg(issuer, resource);
          } else {
            AssetModule.addDataUrl(issuer, resource);
          }
        }

        if (rawRequest !== resource) {
          ResourceResolver.addResolvedFile(context, rawRequest, resource);
        }

        if (resolveData.dependencyType === 'url') {
          // TODO: detect correct type by usage other loaders like 'responsive-loader'
          module.isDependencyTypeUrl = true;
          if (resolveData.contextInfo.issuer) {
            ResourceResolver.addToModuleCache(resource, rawRequest, issuer);
          }
        }
      });

      // build module
      compilation.hooks.buildModule.tap(plugin, (module) => {
        if (module.type === 'asset/resource') {
          // if used `html` method fix the CSS module to extract generated source code of CSS
          if (AssetModule.isCssModule(module)) {
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
        (result, { chunk, chunkGraph, outputOptions, codeGenerationResults }) => {
          if (chunk instanceof HotUpdateChunk) return;

          const entry = AssetEntry.findByName(chunk.name);

          // process only entries supported by this plugin
          if (!entry) return;

          const chunkModules = chunkGraph.getChunkModulesIterable(chunk);
          const sources = new Set();
          const contentHashType = 'javascript';
          let assetFile = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });

          // the current resource issuer
          let resourceIssuer = '';

          entry.filename = assetFile;
          AssetScript.setIssuerFilename(entry.importFile, assetFile);

          if (verbose) this.verboseEntry(entry);

          for (const module of chunkModules) {
            const sourceFile = module.resource;

            if (!sourceFile || AssetModule.isDataUrl(sourceFile)) continue;

            // add needless chunks to trash
            if (AssetScript.has(sourceFile)) {
              const file = module.buildInfo.filename;
              if (file != null) {
                AssetTrash.toTrash(file);
              }
              continue;
            }

            const { buildInfo } = module;
            const resourceResolveDataContext = module.resourceResolveData.context || {};
            const issuerFile = resourceResolveDataContext.issuer || sourceFile;

            // decide asset type by webpack option parser.dataUrlCondition.maxSize
            if (module.type === 'asset') {
              module.type = module.buildInfo.dataUrl === true ? 'asset/inline' : 'asset/resource';
            }

            if (AssetEntry.isEntryModule(module) && chunkGraph.isEntryModuleInChunk(module, chunk)) {
              // entry-point
              const source = module.originalSource();
              // module builder error
              if (source == null) return;

              const pluginModule = this.getModule(sourceFile) || entry;

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

              resourceIssuer = entry.importFile;
            } else if (module.type === 'javascript/auto') {
              // require a resource supported via the plugin module, e.g. style
              const source = module.originalSource();
              // module builder error
              if (source == null) return;

              const pluginModule = this.getModule(sourceFile);
              if (pluginModule == null) continue;

              let { name } = path.parse(sourceFile);
              const filenameTemplate = pluginModule.filename ? pluginModule.filename : entry.filenameTemplate;

              // TODO: research why sometimes the id is relative path instead of a number, it's ok?
              const id = chunkGraph.getModuleId(module);

              // reserved: get real hash of module source
              //const hash = codeGenerationResults.getHash(module, chunk.runtime);
              const hash = buildInfo.assetInfo ? buildInfo.assetInfo.contenthash : buildInfo.hash;

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

              let assetFile = compilation.getAssetPath(filenameTemplate, contextData);
              assetFile = AssetModule.getUniqueFilename(sourceFile, assetFile);

              // skip already processed assets
              if (assetFile === false) continue;

              const postprocessInfo = {
                isEntry: false,
                verbose: pluginModule.verbose || entry.verbose,
                filename: filenameTemplate,
                sourceFile,
                outputFile: entry.file,
                assetFile,
              };

              if (verbose) {
                this.verboseExtractModule({
                  issuerFile,
                  sourceFile,
                  assetFile: path.join(webpackOutputPath, assetFile),
                });
              }

              sources.add({
                isEntry: false,
                // compiler arguments
                source: source.source().toString(),
                sourceFile,
                assetFile,
                pluginModule,
                // result options
                postprocessInfo,
                identifier: `${plugin}.${chunk.id}.${id}`,
                pathOptions: contextData,
                hash,
                filenameTemplate,
              });

              ResourceResolver.addToChunkCache(module, path.posix.join(webpackPublicPath, assetFile));
              resourceIssuer = sourceFile;
            } else if (module.type === 'asset/resource') {
              // require a resource in pug or in css via url()
              let assetFile = buildInfo.filename;

              // TODO: refactoring code for 'responsive-loader'
              // -- BEGIN resource loader --
              const resourceQuery = url.parse(module.rawRequest, true).query;

              if (resourceQuery && resourceQuery.prop) {
                const prop = resourceQuery.prop;
                const originalSource = module.originalSource();
                const source = originalSource ? originalSource.source().toString() : null;

                if (source) {
                  const contextObject = vm.createContext({
                    __webpack_public_path__: webpackPublicPath,
                    module: { exports: {} },
                  });
                  const script = new vm.Script(source, { filename: sourceFile });
                  const result = script.runInContext(contextObject);
                  if (result && result.hasOwnProperty(prop)) {
                    AssetTrash.toTrash(assetFile);
                    assetFile = result[prop];
                    ResourceResolver.addToChunkCache(module, assetFile);

                    if (verbose) {
                      this.verboseExtractResource({
                        issuerFile,
                        sourceFile,
                        outputPath: webpackOutputPath,
                        assetFile,
                      });
                    }
                    continue;
                  }
                }
              }

              // fallback: retrieve all generated assets as coma-separated list
              // get the real filename of the asset by usage a loader for the resource, e.g. `responsive-loader`
              // and add the original asset file to trash to remove it from compilation
              if (buildInfo.assetsInfo != null) {
                const assets = Array.from(buildInfo.assetsInfo.keys());
                if (assets.length > 0) {
                  // dummy size for srcSec attribute with more than 2 files
                  let defaultSize = assets.length > 1 ? ' 1' : '';
                  const realAssetFile = assets
                    .map((value) => path.posix.join(webpackPublicPath, value) + defaultSize)
                    .join(',');
                  if (realAssetFile) {
                    AssetTrash.toTrash(assetFile);
                    assetFile = realAssetFile;
                    ResourceResolver.addToChunkCache(module, assetFile);

                    if (verbose) {
                      this.verboseExtractResource({
                        issuerFile,
                        sourceFile,
                        outputPath: webpackOutputPath,
                        assetFile,
                      });
                    }
                    continue;
                  }
                }
              }
              // -- END resource loader --

              assetFile = path.posix.join(webpackPublicPath, assetFile);

              if (verbose) {
                this.verboseExtractResource({
                  issuerFile,
                  sourceFile,
                  outputPath: webpackOutputPath,
                  assetFile,
                });
              }

              if (module.isDependencyTypeUrl) {
                ResourceResolver.setAssetFileInModuleCache(module.resource, assetFile);
              } else {
                ResourceResolver.addToChunkCache(module, assetFile);
              }
            } else if (module.type === 'asset/inline') {
              if (AssetModule.hasExt(sourceFile, 'svg')) {
                // reserved: extract SVG from processed source of module
                // const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
                // const encodedData = dataUrl.slice(dataUrl.indexOf('base64,') + 7);
                // const svg = Buffer.from(encodedData, 'base64').toString();
                AssetModule.setInlineSvg(assetFile, module);
              } else {
                if (!AssetModule.hasDataUrl(sourceFile)) {
                  const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
                  AssetModule.setDataUrlContent(sourceFile, dataUrl);
                }
              }
            }
          }

          for (let item of sources) {
            if (!item.source) continue;
            // note: by any error in webpack config the source is empty
            let compiledResult = this.compileSource(
              item.source,
              item.sourceFile,
              item.assetFile,
              item.postprocessInfo,
              item.pluginModule
            );

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

      // direct after renderManifest
      compilation.hooks.chunkAsset.tap(plugin, (chunk, file) => {
        // avoid saving runtime js files from node_modules as assets by usage of the splitChunks optimization,
        // because it is never used in assets, it's wrong extracted files by webpack
        if (chunk.chunkReason && chunk.chunkReason.indexOf('defaultVendors') > 0) {
          const modules = compilation.chunkGraph.getChunkModules(chunk);
          if (modules.length === 1) {
            const module = modules[0];
            const { managedFiles } = module.buildInfo.snapshot;
            if (
              managedFiles &&
              managedFiles.has(module.request) &&
              /\/node_modules\/(.+?)\/runtime\//.test(module.request)
            ) {
              AssetTrash.toTrash(file);
            }
          }
        }
      });

      // only here can be an asset deleted or emitted
      compilation.hooks.processAssets.tap(
        { name: plugin, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (assets) => {
          AssetTrash.clearCompilation(compilation);
        }
      );

      // postprocess for assets content
      // only at this stage the js file has the final hashed name
      compilation.hooks.afterProcessAssets.tap(plugin, () => {
        AssetScript.replaceSourceFilesInCompilation(compilation, webpackPublicPath);
        AssetModule.insertInlineSvg(compilation);
      });
    });
  }

  /**
   * Compile the source generated by loaders such as `css-loader`, `html-loader`, `pug-loader`.
   *
   * @param {string} source The source generated by `css-loader`.
   * @param {string} sourceFile The full path of source file.
   * @param {string} assetFile
   * @param {{}} postprocessInfo
   * @param {ModuleOptions} pluginModule
   * @return {Buffer}
   */
  compileSource(source, sourceFile, assetFile, postprocessInfo, pluginModule) {
    let result, compiledCode;
    ResourceResolver.setIssuer(sourceFile);

    const sourceCjs = this.toCommonJS(source);
    const contextOptions = {
      require: ResourceResolver.require,
      // the `module.id` is required for `css-loader`, in module extractCss expected as source path
      module: { id: sourceFile },
    };
    const contextObject = vm.createContext(contextOptions);
    const script = new vm.Script(sourceCjs, { filename: sourceFile });

    compiledCode = script.runInContext(contextObject) || '';

    try {
      result = isFunction(compiledCode) ? compiledCode() : compiledCode;
    } catch (error) {
      executeTemplateFunctionException(error, sourceFile, source);
    }

    // pretty format HTML
    if (this.pretty === true && /\.(pug|jade|html)$/.test(sourceFile) && typeof result === 'string') {
      result = Pretty.format(result);
    }

    try {
    } catch (error) {}

    if (pluginModule) {
      if (pluginModule.extract) {
        result = pluginModule.extract(result, assetFile, this.compilation);
      }
      if (pluginModule.postprocess) {
        try {
          result = pluginModule.postprocess(result, postprocessInfo, this.compilation);
        } catch (error) {
          postprocessException(error, postprocessInfo);
        }
      }
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
   * @param {string} request The request of a source file, can contain a query string.
   * @returns {ModuleOptions | undefined}
   */
  getModule(request) {
    const { resource } = parseRequest(request);
    return this.options.modules.find((module) => module.enabled !== false && module.test.test(resource));
  }

  /**
   * @param {AssetEntryOptions} entry
   */
  verboseEntry(entry) {
    if (!entry) return;
    outToConsole(
      `${ansis.black.bgYellow(`[${plugin}]`)} Compile the entry ${ansis.green(entry.name)}\n` +
        ` filename: ${
          isFunction(entry.filenameTemplate)
            ? ansis.greenBright('[Function: filename]')
            : ansis.magenta(entry.filenameTemplate.toString())
        }\n` +
        ` source: ${ansis.cyan(entry.importFile)}\n` +
        ` output: ${ansis.cyanBright(entry.file)}\n`
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
        ` source: ${ansis.cyan(sourceFile)}\n` +
        ` output: ${ansis.cyanBright(assetFile)}\n`
    );
  }

  /**
   * @param {string} issuerFile
   * @param {string} sourceFile
   * @param {string} outputPath
   * @param {string} assetFile
   */
  verboseExtractResource({ issuerFile, sourceFile, outputPath, assetFile }) {
    outToConsole(
      `${ansis.black.bgYellow(`[${plugin}]`) + ansis.black.bgGreen(` Extract Resource `)} in ` +
        `${ansis.green(issuerFile)}\n` +
        `      source: ${ansis.cyan(sourceFile)}\n` +
        //` output: ${ansis.cyanBright(assetFile)}\n`
        ` output path: ${ansis.cyanBright(outputPath)}\n` +
        `       asset: ${ansis.cyanBright(assetFile)}\n`
    );
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
//module.exports.loader = require.resolve('../../pug-loader'); // local dev only
