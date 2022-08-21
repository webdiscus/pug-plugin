const vm = require('vm');
const path = require('path');

// the 'webpack-sources' is already in webpack dependency
// noinspection NpmUsedModulesInstalled (JetBrains)
const { RawSource } = require('webpack-sources');
const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { pluginName } = require('./config');
const { isFunction, toCommonJS } = require('./Utils');

const { loader, plugin } = require('./Modules');
const extractCss = require('./modules/extractCss');
const extractHtml = require('./modules/extractHtml');

const Resolver = require('./Resolver');
const UrlDependency = require('./UrlDependency');
const Pretty = require('./Pretty');

const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetResource = require('./AssetResource');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const AssetTrash = require('./AssetTrash');

const {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
  verboseExtractInlineResource,
} = require('./Verbose');

const {
  optionModulesException,
  executeTemplateFunctionException,
  postprocessException,
  webpackEntryWarning,
} = require('./Exceptions');

/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import("webpack").ChunkGraph} ChunkGraph */
/** @typedef {import("webpack").Chunk} Chunk */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").sources.Source} Source */
/** @typedef {import('webpack-sources').RawSource} RawSource */
/** @typedef {import("webpack").Configuration} Configuration */
/** @typedef {import('webpack').PathData} PathData */
/** @typedef {import("webpack").AssetInfo} AssetInfo */

/**
 * @typedef {Object} PugPluginOptions
 * @property {RegExp} [test = /\.(pug)$/] The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {boolean} [pretty = false] Formatted output of generated HTML.
 * @property {string|null} [sourcePath = options.context] The absolute path to sources.
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 *   See https://webpack.js.org/configuration/output/#outputfilename.
 *   Must be an absolute or a relative by the context path.
 * @property {function(string, ResourceInfo, Compilation): string|null} postprocess The post process for extracted content from entry.
 * @property {Array<ModuleOptions>} [modules = []]
 * @property {ModuleOptions|{}} extractCss The options for embedded plugin module to extract CSS.
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
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The post process for extracted content from entry.
 * @property {function(sourceMaps: string, assetFile: string, compilation: Compilation): string|null =} extract
 */

/**
 * @typedef {Object} AssetEntryOptions
 * @property {string} name The key of webpack entry.
 * @property {string} file The output asset file with absolute path.
 * @property {string} assetFile The output asset file with relative path by webpack output path.
 *   Note: the method compilation.emitAsset() use this file as key of assets object
 *   and save the file relative by output path, defined in webpack.options.output.path.
 * @property {string|function(PathData, AssetInfo): string} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only these substitutions: [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 * @property {string} importFile
 * @property {string} outputPath
 * @property {string} sourcePath
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {function(string, AssetInfo, Compilation): string} [postprocess = null] The post process for extracted content from entry.
 * @property {function(): string|null =} extract
 * @property {Array} resources
 * @property {boolean} [verbose = false] Show an information by handles of the entry in a postprocess.
 */

/**
 * @typedef {Object} ResourceInfo
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from pug.
 * @property {boolean} [verbose = false] Whether information should be displayed.
 * @property {string|(function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} outputPath The absolute path to output directory of asset.
 * @property {string} assetFile The output asset file relative by outputPath.
 */

const verboseList = new Set();

/**
 * Class PugPlugin.
 */
class PugPlugin {
  /** @type {PugPluginOptions} */
  options = {};

  entryLibrary = {
    name: 'return',
    type: 'jsonp', // compiles JS from source into HTML string via Function()
  };

  // webpack's options and modules
  webpackContext = '';
  webpackOutputPath = '';
  webpackOutputFilename = '';
  HotUpdateChunk = null;

  /**
   * @param {PugPluginOptions|{}} options
   */
  constructor(options = {}) {
    this.options = {
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
      ...options,
    };

    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose === true;
    this.pretty = this.options.pretty === true;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }

    let extractCssOptions = extractCss(options.extractCss);
    const styleTestSource = extractCssOptions.test.source;
    const moduleExtractCssOptions = this.options.modules.find((item) => item.test.source === styleTestSource);

    if (moduleExtractCssOptions) {
      extractCssOptions = moduleExtractCssOptions;
    } else {
      this.options.modules.unshift(extractCssOptions);
    }
    this.options.extractCss = extractCssOptions;

    // let know pug-loader that pug-plugin is being used
    plugin.init(this.options);

    // bind the instance context for using these methods as references in Webpack hooks
    this.afterProcessEntry = this.afterProcessEntry.bind(this);
    this.beforeResolve = this.beforeResolve.bind(this);
    this.afterCreateModule = this.afterCreateModule.bind(this);
    this.beforeBuildModule = this.beforeBuildModule.bind(this);
    this.renderManifest = this.renderManifest.bind(this);
    this.afterProcessAssets = this.afterProcessAssets.bind(this);
    this.done = this.done.bind(this);
  }

  /**
   * Get plugin module depend on type of source file.
   *
   * @param {string} sourceFile The source file of asset.
   * @returns {ModuleOptions|undefined}
   */
  getModule(sourceFile) {
    return this.options.modules.find((module) => module.enabled !== false && module.test.test(sourceFile));
  }

  /**
   * Apply plugin.
   * @param {{}} compiler
   */
  apply(compiler) {
    if (!this.enabled) return;

    const { webpack } = compiler;
    const webpackOptions = compiler.options;

    // save using webpack options
    this.webpackContext = webpackOptions.context;
    this.webpackOutputPath = webpackOptions.output.path;
    this.webpackOutputFilename = webpackOptions.output.filename;
    this.HotUpdateChunk = webpack.HotUpdateChunk;
    //this.RawSource = webpack.sources.RawSource;

    Asset.init({
      outputPath: this.webpackOutputPath,
      publicPath: webpackOptions.output.publicPath,
    });
    AssetResource.init(compiler);
    AssetEntry.setWebpackOutputPath(this.webpackOutputPath);

    // clear caches by tests for webpack serve/watch
    AssetScript.clear();
    Resolver.clear();
    AssetEntry.clear();

    // enable library type
    const libraryType = this.entryLibrary.type;
    if (webpackOptions.output.enabledLibraryTypes.indexOf(libraryType) < 0) {
      webpackOptions.output.enabledLibraryTypes.push(libraryType);
    }

    if (!this.options.sourcePath) this.options.sourcePath = this.webpackContext;
    if (!this.options.outputPath) this.options.outputPath = this.webpackOutputPath;

    // entry options
    compiler.hooks.entryOption.tap(pluginName, this.afterProcessEntry);

    // this compilation
    compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory, contextModuleFactory }) => {
      this.compilation = compilation;

      Resolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        rootContext: this.webpackContext,
      });

      UrlDependency.init({
        fs: normalModuleFactory.fs.fileSystem,
        moduleGraph: compilation.moduleGraph,
      });

      AssetEntry.setCompilation(compilation);

      // resolve modules
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, this.beforeResolve);
      contextModuleFactory.hooks.alternativeRequests.tap(pluginName, this.filterAlternativeRequests);

      // build modules
      normalModuleFactory.hooks.module.tap(pluginName, this.afterCreateModule);
      compilation.hooks.buildModule.tap(pluginName, this.beforeBuildModule);
      compilation.hooks.succeedModule.tap(pluginName, this.afterBuildModule);

      // render source code of modules
      compilation.hooks.renderManifest.tap(pluginName, this.renderManifest);

      // after render sources
      compilation.hooks.processAssets.tap(
        { name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (assets) => {
          AssetTrash.clearCompilation(compilation);
        }
      );

      // postprocess for assets content
      compilation.hooks.afterProcessAssets.tap(pluginName, this.afterProcessAssets);
    });

    compiler.hooks.done.tap(pluginName, this.done);
  }

  /**
   * Called after the entry configuration from webpack options has been processed.
   *
   * @param {string} context The base directory, an absolute path, for resolving entry points and loaders from the configuration.
   * @param {Object<name:string, entry: Object>} entries The webpack entries.
   */
  afterProcessEntry(context, entries) {
    const scriptExtensionRegexp = /\.(js|cjs|mjs|ts|tsx)$/;
    const styleExtensionRegexp = /\.(css|scss|sass|less|styl)$/;
    const extensionRegexp = this.options.test;

    for (let name in entries) {
      const entry = entries[name];
      let { filename: filenameTemplate, sourcePath, outputPath, postprocess, extract, verbose } = this.options;
      const importFile = entry.import[0];
      let [sourceFile] = importFile.split('?', 1);
      const module = this.getModule(sourceFile);

      // scripts and styles are not allowed in the entry, they must be specified directly in Pug
      if (scriptExtensionRegexp.test(sourceFile) || styleExtensionRegexp.test(sourceFile)) {
        const relativeSourceFile = path.relative(this.webpackContext, sourceFile);
        webpackEntryWarning(relativeSourceFile);
      }

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
      if (entry.filename) filenameTemplate = entry.filename;

      if (!path.isAbsolute(sourceFile)) {
        sourceFile = path.join(sourcePath, sourceFile);
        entry.import[0] = path.join(sourcePath, importFile);
      }

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

      AssetEntry.add(entry, assetEntryOptions);
    }
  }

  /**
   * Called when a new dependency request is encountered.
   *
   * @param {Object} resolveData
   * @return {boolean|undefined} Return undefined to processing, false to ignore dependency.
   */
  beforeResolve(resolveData) {
    const { context, request, contextInfo } = resolveData;
    const { issuer } = contextInfo;

    // ignore data-URL
    if (request.startsWith('data:')) return;

    if (issuer && issuer.length > 0) {
      const [requestFile] = request.split('?', 1);
      const extractCss = this.options.extractCss;
      if (extractCss.enabled && extractCss.test.test(issuer) && requestFile.endsWith('.js')) {
        // ignore runtime scripts of a loader, because a style can't have a javascript dependency
        return false;
      }

      const scriptFile = AssetScript.resolveFile(request);
      if (scriptFile) {
        const name = AssetScript.getUniqueName(scriptFile, issuer);
        const res = AssetEntry.addToCompilation({
          name,
          importFile: scriptFile,
          filenameTemplate: this.webpackOutputFilename,
          context,
          issuer,
        });

        return res ? undefined : false;
      }
    }

    if (resolveData.dependencyType === 'url') {
      UrlDependency.resolve(resolveData);
    }
  }

  /**
   * Filter alternative requests.
   *
   * Pug files should not have alternative requests.
   * If pug file contains require and is compiled with `compile` method,
   * then ContextModuleFactory generate additional needless request as relative path without query.
   * Such 'alternative request' must be removed from compilation.
   *
   * @param {Array<{}>} requests
   * @param {{}} options
   * @return {Array} Returns only alternative requests not related to Pug Files.
   */
  filterAlternativeRequests(requests, options) {
    return requests.filter((item) => !item.request.endsWith('.pug'));
  }

  /**
   * Called after a NormalModule instance is created.
   *
   * @param {Object} module
   * @param {Object} createData
   * @param {Object} resolveData
   */
  afterCreateModule(module, createData, resolveData) {
    const { type, loaders } = module;
    const { rawRequest, resource } = createData;
    const issuer = resolveData.contextInfo.issuer;

    if (!issuer || AssetInline.isDataUrl(rawRequest)) return;

    if (type === 'asset/inline' || type === 'asset') {
      AssetInline.add(resource, issuer);
    }

    if (resolveData.dependencyType === 'url') {
      if (AssetScript.isScript(module)) return;

      module.__isDependencyTypeUrl = true;
      Resolver.addAsset(resource, undefined, issuer);
    }

    // add resolved sources in use cases:
    // - if used url() in SCSS for source assets
    // - if used import url() in CSS, like `@import url('./styles.css');`
    // - if used webpack context
    if (module.__isDependencyTypeUrl === true || loaders.length > 0 || type === 'asset/resource') {
      Resolver.addSourceFile(resource, rawRequest, issuer);
    }
  }

  /**
   * Called before a module build has started.
   * @param {Object} module
   */
  beforeBuildModule(module) {
    if (
      module.type === 'asset/resource' &&
      (AssetScript.isScript(module) || (module.__isDependencyTypeUrl === true && Asset.isStyle(module)))
    ) {
      // set correct module type for scripts and styles when used the `html` method of PugLoader
      module.type = 'javascript/auto';
      module.binary = false;
      module.parser = new JavascriptParser('auto');
      module.generator = new JavascriptGenerator();
    }
  }

  /**
   * Called after a module has been built successfully.
   *
   * @param {Object} module The Webpack module.
   */
  afterBuildModule(module) {
    // decide asset type by webpack option parser.dataUrlCondition.maxSize
    if (module.type === 'asset') {
      module.type = module.buildInfo.dataUrl === true ? 'asset/inline' : 'asset/resource';
    }
  }

  /**
   * @param {Array<Object>} result
   * @param {Object} chunk
   * @param {Object} chunkGraph
   * @param {Object} outputOptions
   * @param {Object} codeGenerationResults
   */
  renderManifest(result, { chunk, chunkGraph, outputOptions, codeGenerationResults }) {
    const { compilation, HotUpdateChunk, verbose } = this;

    if (chunk instanceof HotUpdateChunk) return;

    const entry = AssetEntry.get(chunk.name);

    // process only entries supported by this plugin
    if (!entry) return;

    const assetModules = new Set();
    const contentHashType = 'javascript';
    const chunkModules = chunkGraph.getChunkModulesIterable(chunk);

    entry.filename = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });
    AssetScript.setIssuerFilename(entry.importFile, entry.filename);

    for (const module of chunkModules) {
      const { buildInfo, resource } = module;

      if (!resource || AssetInline.isDataUrl(resource)) continue;

      const { issuer } = module.resourceResolveData.context;
      const [sourceFile] = resource.split('?', 1);
      let issuerFile = !issuer || issuer.endsWith('.pug') ? entry.importFile : issuer;

      if (module.type === 'javascript/auto') {
        // do nothing for scripts because webpack itself compiles and extracts JS files from scripts
        if (AssetScript.isScript(module)) continue;

        // entry point
        if (sourceFile === entry.importFile) {
          const source = module.originalSource();
          // break process by module builder error
          if (source == null) return;

          const { filename: assetFile } = entry;

          Asset.add(sourceFile, assetFile);

          if (verbose) {
            verboseList.add({
              isEntry: true,
              name: chunk.name,
            });
          }

          assetModules.add({
            // postprocessInfo
            isEntry: true,
            verbose: entry.verbose,
            outputPath: entry.outputPath,
            filenameTemplate: entry.filenameTemplate,
            // renderContent arguments
            source,
            sourceFile,
            assetFile,
            pluginModule: entry,
            fileManifest: {
              filename: assetFile,
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[contentHashType],
            },
          });

          continue;
        }

        // asset supported via the plugin module
        const pluginModule = this.getModule(sourceFile);
        if (pluginModule == null) continue;

        const source = module.originalSource();
        // break process by module builder error
        if (source == null) return;

        // note: the `id` is
        // - in production mode as a number
        // - in development mode as a relative path
        const id = chunkGraph.getModuleId(module);
        const { name } = path.parse(sourceFile);
        const hash = buildInfo.assetInfo ? buildInfo.assetInfo.contenthash : buildInfo.hash;
        const filenameTemplate = pluginModule.filename ? pluginModule.filename : entry.filenameTemplate;

        /** @type {PathData} The data to generate an asset path by filenameTemplate. */
        const pathOptions = {
          contentHash: hash,
          chunk: {
            chunkId: chunk.id,
            id,
            name,
            hash,
          },
        };

        const assetPath = compilation.getAssetPath(filenameTemplate, pathOptions);
        const { isCached, filename: assetFile } = Asset.getUniqueFilename(sourceFile, assetPath);

        Resolver.addAsset(resource, assetFile, issuerFile);

        // skip already processed assets
        if (isCached === true) {
          continue;
        }

        const moduleVerbose = pluginModule.verbose || entry.verbose;
        const moduleOutputPath = pluginModule.outputPath || entry.outputPath;

        if (moduleVerbose) {
          verboseList.add({
            isModule: true,
            header: pluginModule.verboseHeader,
            sourceFile,
            outputPath: moduleOutputPath,
          });
        }

        assetModules.add({
          // postprocessInfo
          isEntry: false,
          verbose: moduleVerbose,
          outputPath: moduleOutputPath,
          filenameTemplate,
          // renderContent arguments
          source,
          sourceFile,
          assetFile,
          pluginModule,
          fileManifest: {
            filename: assetFile,
            identifier: `${pluginName}.${chunk.id}.${id}`,
            hash,
          },
        });
      } else if (module.type === 'asset/resource') {
        // resource required in pug or in css via url()
        AssetResource.render(module, issuerFile);
        if (verbose) {
          verboseList.add({
            isAssetResource: true,
            sourceFile: resource,
          });
        }
      } else if (module.type === 'asset/inline') {
        AssetInline.render({ module, chunk, codeGenerationResults, issuerAssetFile: entry.filename });
        if (verbose) {
          verboseList.add({
            isAssetInline: true,
            sourceFile: resource,
          });
        }
      }
    }

    // render modules after collection of dependencies in all chunks
    for (let module of assetModules) {
      const { fileManifest } = module;
      const content = this.renderModule(module);

      if (content != null) {
        fileManifest.render = () => new RawSource(content);
        result.push(fileManifest);
      }
    }
  }

  /**
   * Called after the processAssets hook had finished without error.
   * @note: Only at this stage the js file has the final hashed name.
   */
  afterProcessAssets() {
    const compilation = this.compilation;

    if (this.options.extractComments !== true) {
      AssetTrash.removeComments(compilation);
    }

    AssetScript.replaceSourceFilesInCompilation(compilation);
    AssetInline.insertInlineSvg(compilation);
  }

  /**
   * Render the module source code generated by loaders such as `css-loader`, `html-loader`, `pug-loader`.
   *
   * @param {string} code The source code.
   * @param {string} sourceFile The full path of source file.
   * @param {string} assetFile
   * @param {ModuleOptions} pluginModule
   * @return {string|null}
   */
  renderModule({ source, sourceFile, assetFile, isEntry, verbose, outputPath, filenameTemplate, pluginModule }) {
    let code = source.source();

    if (!code) {
      // TODO: reproduce this error and write test
      // the source is empty when webpack config contains an error
      return null;
    }

    if (code.indexOf('export default') > -1) {
      code = toCommonJS(code);
    }

    Resolver.setIssuer(sourceFile);

    const contextOptions = {
      require: Resolver.require,
      // the `module.id` is required for `css-loader`, in module extractCss expected as source path
      module: { id: sourceFile },
    };
    const contextObject = vm.createContext(contextOptions);
    const script = new vm.Script(code, { filename: sourceFile });
    const compiledCode = script.runInContext(contextObject) || '';
    let content;

    try {
      content = isFunction(compiledCode) ? compiledCode() : compiledCode;
    } catch (error) {
      executeTemplateFunctionException(error, sourceFile, code);
    }

    // pretty format HTML
    if (this.pretty === true && /\.(pug|jade|html)$/.test(sourceFile) && typeof content === 'string') {
      content = Pretty.format(content);
    }

    if (pluginModule) {
      if (pluginModule.extract) {
        content = pluginModule.extract(content, assetFile, this.compilation);
      }
      if (pluginModule.postprocess) {
        const postprocessInfo = {
          isEntry,
          verbose,
          outputPath,
          sourceFile,
          assetFile,
          filename: filenameTemplate,
        };
        try {
          content = pluginModule.postprocess(content, postprocessInfo, this.compilation);
        } catch (error) {
          postprocessException(error, postprocessInfo);
        }
      }
    }

    return content;
  }

  /**
   * Executed when the compilation has completed.
   * Reset initial settings for webpack serve/watch.
   *
   * @param {Object} stats
   */
  done(stats) {
    // display verbose after rendering of all modules
    if (verboseList.size > 0) {
      for (let item of verboseList) {
        const { isEntry, isModule, isAssetResource, isAssetInline, sourceFile } = item;
        if (isEntry) {
          const entry = AssetEntry.get(item.name);
          verboseEntry(entry);
        } else if (isModule) {
          const data = Resolver.data.get(sourceFile);
          verboseExtractModule({
            sourceFile,
            assetFile: data.originalAssetFile,
            issuers: data.issuers,
            outputPath: item.outputPath,
            header: item.header,
          });
        } else if (isAssetResource) {
          const data = Resolver.data.get(sourceFile);
          verboseExtractResource({
            sourceFile,
            assetFile: data.originalAssetFile,
            issuers: data.issuers,
            outputPath: this.webpackOutputPath,
          });
        } else if (isAssetInline) {
          const data = AssetInline.data.get(sourceFile);
          verboseExtractInlineResource({
            sourceFile,
            data,
          });
        }
      }
    }
    verboseList.clear();
    Asset.reset();
    AssetEntry.reset();
    AssetScript.reset();
    AssetTrash.reset();
    Resolver.reset();
  }
}

module.exports = PugPlugin;
module.exports.extractCss = extractCss;
module.exports.extractHtml = extractHtml;
module.exports.loader = loader;
