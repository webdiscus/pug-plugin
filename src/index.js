const vm = require('vm');
const path = require('path');
const ansis = require('ansis');
const { merge } = require('webpack-merge');

const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { plugin, isWin } = require('./config');
const { extractHtml, extractCss } = require('./modules');
const { isFunction, pathToPosix, outToConsole } = require('./utils');
const { urlDependencyResolver, resourceResolver } = require('./resolver');

const {
  optionModulesException,
  publicPathException,
  executeTemplateFunctionException,
  postprocessException,
  addEntryException,
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

  preprocess(content) {},

  // each entry has its own local options that override global options
  modules: [],
};

class PugPlugin {
  /** @type {AssetEntry[]} */
  entries = [];
  entryIndex = 1;

  /**
   * @type {{
   *   files: {},
   *   trashAssets: [],
   *   add(name: string, request: string, issuer: string): void,
   *   setIssuerFilename(issuer: string, filename: string): void,
   *   has(request: string): boolean,
   *   reset(): void
   * }}
   */
  scripts = {
    files: {},
    trashAssets: [],

    add(name, request, issuer) {
      this.files[request] = {
        name,
        issuer: {
          filename: undefined,
          request: issuer,
        },
      };
    },

    setIssuerFilename(issuer, filename) {
      for (let request in this.files) {
        if (this.files[request].issuer.request === issuer) {
          this.files[request].issuer.filename = filename;
        }
      }
    },

    has(request) {
      return this.files.hasOwnProperty(request);
    },

    getResource(request) {
      const [resource, query] = request.split('?');

      return query === 'isScript' ? resource : null;
    },

    reset() {
      this.files = {};
      this.trashAssets = [];
    },
  };

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
    const {
      path: webpackOutputPath,
      publicPath: webpackOutputPublicPath,
      filename: webpackOutputFilename,
    } = webpackOptions.output;
    const { RawSource } = compiler.webpack.sources;
    const { EntryPlugin, HotUpdateChunk } = compiler.webpack;

    // TODO: resolveInPaths 'auto' publicPath
    if (webpackOutputPublicPath == null || webpackOutputPublicPath === 'auto') publicPathException();

    resourceResolver.init({
      publicPath: webpackOutputPublicPath,
    });

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

    // Normal Module Factory
    compiler.hooks.normalModuleFactory.tap(plugin, (normalModuleFactory) => {
      urlDependencyResolver.init(normalModuleFactory.fs.fileSystem);
      this.scripts.reset();

      normalModuleFactory.hooks.createModule.tap(plugin, (createData, resolveData) => {
        const { context, rawRequest, resource } = createData;
        if (rawRequest !== resource) {
          resourceResolver.addResolvedFile(context, rawRequest, resource);
        }
      });

      normalModuleFactory.hooks.beforeResolve.tap(plugin, (resolveData) => {
        const compilation = this.compilation;
        const { context, request } = resolveData;
        const scriptResource = this.scripts.getResource(request);

        if (scriptResource != null) {
          const { issuer } = resolveData.contextInfo;
          let { name } = path.parse(scriptResource);
          const existsName = this.entries.find((item) => item.name === name);

          // the entrypoint name must be unique, if already exists then add index: `main` => `main1`, `main2`, etc
          if (existsName) name += this.entryIndex++;
          this.scripts.add(name, scriptResource, issuer);
          resolveData.request = scriptResource;

          // TODO: refactoring - add to entry as function
          const outputPath = webpackOutputPath;
          const relativeOutputPath = path.relative(webpackOutputPath, outputPath);
          const filenameTemplate = webpackOutputFilename;
          const assetEntry = {
            name,
            filenameTemplate: filenameTemplate,
            filename: undefined,
            file: undefined,
            importFile: scriptResource,
            sourcePath: context,
            outputPath: outputPath,
            postprocess: undefined,
            extract: undefined,
            verbose: true,
          };

          const entryOptions = {
            name,
            filename(pathData, assetInfo) {
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
            },
            runtime: undefined,
            layer: undefined,
            dependOn: undefined,
            baseUri: undefined,
            publicPath: undefined,
            chunkLoading: undefined,
            asyncChunks: undefined,
            wasmLoading: undefined,
            library: undefined,
          };

          // see reference: node_modules/webpack/lib/EntryPlugin.js
          const dep = EntryPlugin.createDependency(scriptResource, { name });
          compilation.addEntry(context, dep, entryOptions, (err) => {
            if (err) addEntryException(err, name);
          });
          this.entries.push(assetEntry);
        } else if (resolveData.dependencyType === 'url') {
          urlDependencyResolver.resolve(resolveData);
        }
      });
    });

    // This compilation
    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      const verbose = this.verbose;
      this.compilation = compilation;

      // build module
      compilation.hooks.buildModule.tap(plugin, (module) => {
        if (module.type === 'asset/resource') {
          // fix css module, if used the `html` method, to be able to extract css from source code
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
      compilation.hooks.renderManifest.tap(plugin, (result, { chunk, chunkGraph, outputOptions }) => {
        if (chunk instanceof HotUpdateChunk) return;

        const entry = this.getEntryByName(chunk.name);

        // process only entries supported by this plugin
        if (!entry) return;

        const sources = new Set();
        const contentHashType = 'javascript';
        let assetFile = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });

        entry.filename = assetFile;
        this.scripts.setIssuerFilename(entry.importFile, assetFile);
        resourceResolver.scripts = this.scripts;
        resourceResolver.clearChunkCache();

        if (verbose) this.verboseEntry(entry);

        for (const module of chunkGraph.getChunkModules(chunk)) {
          if (!module.resource) continue;

          // add needless chunks to trash
          if (this.scripts.has(module.resource)) {
            const file = module.buildInfo.filename;
            if (file != null) {
              this.scripts.trashAssets.push(file);
            }
            continue;
          }

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

            const filenameTemplate = pluginModule.filename ? pluginModule.filename : entry.filenameTemplate;

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
            const postprocessInfo = {
              isEntry: false,
              verbose: pluginModule.verbose || entry.verbose,
              filename: filenameTemplate,
              sourceFile: module.resource,
              outputFile: entry.file,
              assetFile,
            };

            resourceResolver.addToChunkCache(module, assetFile);

            if (verbose) {
              this.verboseExtractModule({
                issuerFile,
                sourceFile: module.resource,
                assetFile: path.join(webpackOutputPath, assetFile),
              });
            }

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
      });

      // called direct after renderManifest
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
              this.scripts.trashAssets.push(file);
            }
          }
        }
      });

      // only here can be an asset deleted or emitted
      compilation.hooks.processAssets.tap(
        { name: plugin, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (assets) => {
          // clean trash
          this.scripts.trashAssets.forEach((file) => {
            compilation.deleteAsset(file);
          });
        }
      );

      // postprocess for assets content
      // only at this stage the js file has the final hashed name
      compilation.hooks.afterProcessAssets.tap(plugin, () => {
        const RawSource = compiler.webpack.sources.RawSource;
        let existsScripts = [];

        for (let sourceFile in this.scripts.files) {
          const item = this.scripts.files[sourceFile];
          const issuerFile = item.issuer.filename;
          const chunkGroup = compilation.namedChunkGroups.get(item.name);
          const entrypointChunk = chunkGroup.getEntrypointChunk();
          const chunkFile = entrypointChunk.files.values().next().value;
          const outputFile = path.posix.join(webpackOutputPublicPath, chunkFile);

          // replace source filename with asset filename
          const chunkFiles = chunkGroup.getFiles();
          const asset = compilation.assets[issuerFile];

          // continue by a potential error, normally never occur
          if (asset == null) continue;

          const content = asset.source();
          let chunkScripts = '';
          let newContent;

          if (chunkFiles.length > 1) {
            existsScripts.push(chunkFile);

            // generate additional scripts of chunks
            for (let file of chunkFiles) {
              if (existsScripts.indexOf(file) < 0) {
                const scriptFile = path.posix.join(webpackOutputPublicPath, file);
                chunkScripts += `<script src="${scriptFile}"></script>`;
                existsScripts.push(file);
              }
            }

            // inject generated chunks before original <script> and replace source file with output filename
            const srcStartPos = content.indexOf(sourceFile);
            const srcEndPos = srcStartPos + sourceFile.length;
            let tagStartPos = srcStartPos;
            while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}

            newContent =
              content.slice(0, tagStartPos) +
              chunkScripts +
              content.slice(tagStartPos, srcStartPos) +
              outputFile +
              content.slice(srcEndPos);
          } else {
            newContent = content.replace(sourceFile, outputFile);
          }

          compilation.assets[issuerFile] = new RawSource(newContent);
        }
      });
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
    let result;
    resourceResolver.setCurrentContext(path.dirname(sourceFile));

    if (pluginModule && pluginModule.compile) {
      result = pluginModule.compile(source, assetFile);
    } else {
      const contextOptions = {
        require: resourceResolver.require,
        // the `module.id` is required for `css-loader`, in module extractCss expected as source path
        module: { id: sourceFile },
      };
      const contextObject = vm.createContext(contextOptions);
      const sourceCjs = this.toCommonJS(source);
      const script = new vm.Script(sourceCjs, { filename: sourceFile });
      result = script.runInContext(contextObject) || '';
    }

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
