const vm = require('vm');
const path = require('path');
const { merge } = require('webpack-merge');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { plugin } = require('./config');
const { isFunction, parseRequest } = require('./utils');

const extractCss = require('./modules/extractCss');
const extractHtml = require('./modules/extractHtml');

const ResourceResolver = require('./ResourceResolver');
const UrlDependencyResolver = require('./UrlDependencyResolver');
const Pretty = require('./Pretty');

const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const AssetTrash = require('./AssetTrash');

// supports for responsive-loader
const ResponsiveLoader = require('./extras/ResponsiveLoader');

const { verboseEntry, verboseExtractModule, verboseExtractResource } = require('./verbose');
const {
  optionModulesException,
  executeTemplateFunctionException,
  postprocessException,
  webpackEntryWarning,
} = require('./exceptions');

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('webpack').PathData} PathData */
/** @typedef {import('webpack').AssetInfo} AssetInfo */
/** @typedef {import('webpack-sources').RawSource} RawSource */

/**
 * @typedef {Object} PugPluginOptions
 * @property {RegExp} [test = /\.(pug)$/] The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {boolean} [pretty = false] Formatted output of generated HTML.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string | function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 *   See https://webpack.js.org/configuration/output/#outputfilename.
 *   Must be an absolute or a relative by the context path.
 * @property {function(string, ResourceInfo, Compilation): string | null} postprocess The post process for extracted content from entry.
 * @property {ModuleOptions[]} [modules = []]
 * @property {ModuleOptions} extractCss The options for embedded plugin module to extract CSS.
 * @property {boolean} [`extractComments` = false] Whether comments shall be extracted to a separate file.
 *   If the original filename is foo.js, then the comments will be stored to foo.js.LICENSE.txt.
 *   This option enable/disable storing of *.LICENSE.txt file.
 *   For more flexibility use terser-webpack-plugin https://webpack.js.org/plugins/terser-webpack-plugin/#extractcomments.
 */

/**
 * @typedef {Object} ModuleOptions
 * @property {RegExp} test The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string | function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 * @property {function(string, ResourceInfo, Compilation): string | null =} postprocess The post process for extracted content from entry.
 * @property {function(sourceMaps: string, assetFile: string, compilation: Compilation): string | null =} extract
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
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {string | (function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} outputFile The absolute path to generated output file (issuer of asset).
 * @property {string} assetFile The output asset file relative by `output.publicPath`.
 */

/**
 * @type {PugPluginOptions}
 */
const defaultOptions = {
  test: /\.(pug)$/,
  enabled: true,
  verbose: false,
  pretty: false,
  sourcePath: null,
  outputPath: null,
  filename: '[name].html',
  postprocess: null,
  modules: [],
  extractCss: {},
  extractComments: false,
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
    this.options = merge({}, defaultOptions, options);
    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose === true;
    this.pretty = this.options.pretty === true;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }

    let moduleOptions = extractCss(options.extractCss);
    let hasModule = this.options.modules.find((item) => item.test.source === moduleOptions.test.source);
    if (!hasModule) {
      this.options.modules.unshift(moduleOptions);
    }
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

    Asset.init({
      outputPath: webpackOutputPath,
      publicPath: webpackPublicPath,
    });

    AssetScript.init({
      rootContext: webpackOptions.context,
    });

    // clear caches by tests, webpack watch or serve
    AssetEntry.clear();
    AssetScript.clear();
    AssetTrash.reset();
    ResourceResolver.clear();

    // initialize responsible-loader module
    ResponsiveLoader.init(compiler);

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

      ResourceResolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        rootContext: webpackOptions.context,
      });
      UrlDependencyResolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        moduleGraph: compilation.moduleGraph,
      });

      AssetEntry.init(compilation);
      Asset.reset();
      AssetScript.reset();
      AssetTrash.reset();

      // before resolve
      normalModuleFactory.hooks.beforeResolve.tap(plugin, (resolveData) => {
        const { context, request } = resolveData;

        // ignore data-URL
        if (request.startsWith('data:')) return;

        const importFile = AssetScript.resolveFile(request);

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
        const { rawRequest, resource } = createData;
        const issuer = resolveData.contextInfo.issuer;
        const { type, loaders } = module;

        if (!issuer || AssetInline.isDataUrl(rawRequest)) return;

        if (type === 'asset/inline' || type === 'asset') {
          if (AssetInline.hasExt(resource, 'svg') && AssetInline.hasExt(issuer, 'pug')) {
            AssetInline.addInlineSvg(resource, issuer);
          } else {
            AssetInline.addDataUrl(resource, issuer);
          }
        }

        if (resolveData.dependencyType === 'url') {
          module.isDependencyTypeUrl = true;
          ResourceResolver.addToModuleCache(resource, rawRequest, issuer);
        }

        // add resolved sources in use cases:
        // - if used url() in SCSS for source assets
        // - if used import url() in CSS, like `@import url('./styles.css');`
        // - if used webpack context
        if (module.isDependencyTypeUrl || loaders.length > 0 || type === 'asset/resource') {
          ResourceResolver.addSourceFile(resource, rawRequest, issuer);
        }
      });

      // build module
      compilation.hooks.buildModule.tap(plugin, (module) => {
        if (module.type === 'asset/resource') {
          // if used `html` method fix the CSS module to extract generated source code of CSS
          if (AssetInline.isCssModule(module)) {
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

          const sources = new Set();
          const contentHashType = 'javascript';
          const chunkModules = chunkGraph.getChunkModulesIterable(chunk);

          entry.filename = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });
          AssetScript.setIssuerFilename(entry.importFile, entry.filename);

          if (verbose) verboseEntry(entry);

          for (const module of chunkModules) {
            const { buildInfo, resource: sourceFile } = module;

            if (!sourceFile || AssetInline.isDataUrl(sourceFile)) continue;

            // add needless chunks to trash
            if (AssetScript.has(sourceFile)) {
              const file = buildInfo.filename;
              if (file != null) {
                AssetTrash.toTrash(file);
              }
              continue;
            }

            const { issuer } = module.resourceResolveData.context;
            const issuerFile = issuer && !issuer.endsWith('.pug') ? issuer : entry.importFile;

            // decide asset type by webpack option parser.dataUrlCondition.maxSize
            if (module.type === 'asset') {
              module.type = buildInfo.dataUrl === true ? 'asset/inline' : 'asset/resource';
            }

            if (AssetEntry.isEntryModule(module) && chunkGraph.isEntryModuleInChunk(module, chunk)) {
              // entry point
              const source = module.originalSource();
              // module builder error
              if (source == null) return;

              const sourceFile = entry.importFile;
              const pluginModule = this.getModule(sourceFile) || entry;
              const { filename: assetFile } = entry;

              const isScript = assetFile.endsWith('.js');
              const isStyle = assetFile.endsWith('.css');
              if (isScript || isStyle) {
                const relativeSourceFile = path.relative(webpackOptions.context, sourceFile);
                webpackEntryWarning(relativeSourceFile);
              }

              const postprocessInfo = {
                isEntry: true,
                verbose: entry.verbose,
                filename: chunk.filenameTemplate,
                sourceFile,
                outputFile: entry.file,
                assetFile,
              };

              sources.add({
                isEntry: true,
                // compiler arguments
                source: source.source().toString(),
                sourceFile,
                assetFile,
                pluginModule,
                // result options
                postprocessInfo,
                identifier: `${plugin}.${chunk.id}`,
                pathOptions: { chunk, contentHashType },
                hash: chunk.contentHash[contentHashType],
                filenameTemplate: chunk.filenameTemplate,
              });

              Asset.addFile(sourceFile, assetFile);
            } else if (module.type === 'javascript/auto') {
              // processing of the asset supported via the plugin module
              const source = module.originalSource();
              // break process by module builder error
              if (source == null) return;

              const pluginModule = this.getModule(sourceFile);
              if (pluginModule == null) continue;

              // note: the `id` is
              // - in production mode as a number
              // - in development mode as a relative path
              const id = chunkGraph.getModuleId(module);
              const { name } = path.parse(sourceFile);
              const hash = buildInfo.assetInfo ? buildInfo.assetInfo.contenthash : buildInfo.hash;
              const filenameTemplate = pluginModule.filename ? pluginModule.filename : entry.filenameTemplate;

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

              const assetPath = compilation.getAssetPath(filenameTemplate, contextData);
              const { isCached, filename: assetFile } = Asset.getUniqueFilename(sourceFile, assetPath);
              const issuerAssetFile = Asset.findAssetFile(issuerFile);
              const outputAssetFile = Asset.getOutputFile(assetFile, issuerAssetFile);

              // using auto publicPath same asset file can have different output filenames in depend on issuer path
              ResourceResolver.addToChunkCache(sourceFile, outputAssetFile, issuerFile);

              // skip already processed assets
              if (isCached === true) {
                continue;
              }

              const postprocessInfo = {
                isEntry: false,
                verbose: pluginModule.verbose || entry.verbose,
                filename: filenameTemplate,
                sourceFile,
                outputFile: entry.file,
                assetFile,
              };

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

              if (verbose) {
                verboseExtractModule({
                  issuerFile,
                  sourceFile,
                  assetFile: path.join(webpackOutputPath, assetFile),
                });
              }
            } else if (module.type === 'asset/resource') {
              // require a resource in pug or in css via url()
              const assetFile = buildInfo.filename;
              // try to get asset file processed via responsive-loader
              const asset = ResponsiveLoader.getAsset(module, issuerFile);

              if (asset != null) {
                // save a module and handler for asset that may be used in many styles
                ResourceResolver.setExtrasInModuleCache(sourceFile, {
                  module,
                  handler: ResponsiveLoader.getAsset,
                });
                ResourceResolver.addToChunkCache(sourceFile, asset, issuerFile);
                AssetTrash.toTrash(assetFile);

                if (verbose) {
                  verboseExtractResource({
                    issuerFile,
                    sourceFile,
                    outputPath: webpackOutputPath,
                    assetFile: asset,
                  });
                }
                continue;
              }

              // save an asset file that may be used in many styles
              ResourceResolver.setAssetFileInModuleCache(sourceFile, assetFile);

              if (module.isDependencyTypeUrl !== true) {
                const issuerAssetFile = Asset.findAssetFile(issuerFile);
                const outputAssetFile = Asset.getOutputFile(assetFile, issuerAssetFile);
                ResourceResolver.addToChunkCache(sourceFile, outputAssetFile, issuerFile);
              }

              if (verbose) {
                verboseExtractResource({
                  issuerFile,
                  sourceFile,
                  outputPath: webpackOutputPath,
                  assetFile,
                });
              }
            } else if (module.type === 'asset/inline') {
              const assetFile = entry.filename;

              if (AssetInline.hasExt(sourceFile, 'svg')) {
                // reserved: extract SVG from processed source of module
                // const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
                // const encodedData = dataUrl.slice(dataUrl.indexOf('base64,') + 7);
                // const svg = Buffer.from(encodedData, 'base64').toString();
                AssetInline.setInlineSvg(assetFile, module);
              } else {
                if (!AssetInline.hasDataUrl(sourceFile)) {
                  const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
                  AssetInline.setDataUrlContent(sourceFile, dataUrl);
                }
              }
            }
          }

          // normalize moduleCache
          for (let [sourceFile, item] of ResourceResolver.moduleCache) {
            const { assetFile, issuers, rawRequests, extras } = item;

            for (let issuer of issuers) {
              if (assetFile != null) {
                // normalize output asset files
                const issuerAssetFile = Asset.findAssetFile(issuer);
                const assetOutputFile = AssetInline.isDataUrl(assetFile)
                  ? assetFile
                  : Asset.getOutputFile(assetFile, issuerAssetFile);

                ResourceResolver.addToChunkCache(sourceFile, assetOutputFile, issuer);
              } else if (extras != null) {
                // normalize output asset files processed via external loader, e.g. `responsive-loader`
                const assetOutputFile = extras.handler(extras.module, issuer);
                ResourceResolver.addToChunkCache(sourceFile, assetOutputFile, issuer);
              } else {
                // normalize resolved source files
                for (let rawRequest of rawRequests) {
                  ResourceResolver.addSourceFile(sourceFile, rawRequest, issuer);
                }
              }
            }
          }

          for (let item of sources) {
            // the source is empty when webpack config contains an error
            if (!item.source) continue;

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
        if (this.options.extractComments !== true) {
          AssetTrash.removeComments(compilation);
        }

        AssetScript.replaceSourceFilesInCompilation(compilation);
        AssetInline.insertInlineSvg(compilation);
      });
    });
  }

  /**
   * Compile the source generated by loaders such as `css-loader`, `html-loader`, `pug-loader`.
   *
   * @param {string} source The source generated by `css-loader`.
   * @param {string} sourceFile The full path of source file.
   * @param {string} assetFile
   * @param {ResourceInfo} postprocessInfo
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
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = require.resolve('@webdiscus/pug-loader');
//module.exports.loader = require.resolve('../../pug-loader'); // local dev only
