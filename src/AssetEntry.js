const path = require('path');
const { isFunction, parseRequest } = require('./utils');

/**
 * AssetEntry.
 * @singleton
 */
const AssetEntry = {
  /** @type {AssetEntryOptions[]} */
  entries: [],

  /** @type {string[]} */
  addedToCompilationEntryNames: [],

  compilation: null,
  EntryPlugin: null,

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  init(compilation) {
    this.compilation = compilation;
    this.EntryPlugin = compilation.compiler.webpack.EntryPlugin;
    this.resetAdditionalEntries();
  },

  /**
   * @param {{}} entry The webpack entry object.
   * @param {AssetEntryOptions} assetEntryOptions
   * @param {string} webpackOutputPath
   */
  add(entry, assetEntryOptions, webpackOutputPath) {
    const { outputPath, filenameTemplate } = assetEntryOptions;
    const relativeOutputPath = path.isAbsolute(outputPath) ? path.relative(webpackOutputPath, outputPath) : outputPath;

    entry.filename = (pathData, assetInfo) => {
      if (!assetEntryOptions.filename) {
        Object.defineProperty(assetEntryOptions, 'filename', {
          set(filename) {
            // replace the setter with value of resolved filename
            delete this.filename;
            this.filename = filename;
            this.file = path.join(outputPath, filename);
          },
        });
      }

      let filename = isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
      if (relativeOutputPath) {
        filename = path.posix.join(relativeOutputPath, filename);
      }

      return filename;
    };

    this.entries.push(assetEntryOptions);
  },

  /**
   * Add a resource from pug, e.g. script, to webpack compilation.
   *
   * @param {string} name
   * @param {string} importFile
   * @param {string} filenameTemplate
   * @param {string} outputPath
   * @param {string} context
   * @param {string} issuer
   * @return {boolean}
   */
  addToCompilation({ name, importFile, filenameTemplate, outputPath, context, issuer }) {
    // ignore duplicate entries with same name
    if (name === false) return false;

    const entry = {
      name,
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

    /** @type {AssetEntryOptions} */
    const assetEntryOptions = {
      name,
      filenameTemplate,
      filename: undefined,
      file: undefined,
      importFile,
      sourcePath: context,
      outputPath,
      postprocess: undefined,
      extract: undefined,
      verbose: false,
    };

    this.add(entry, assetEntryOptions, outputPath);

    // adds the entry of the script from pug to the compilation
    // see reference: node_modules/webpack/lib/EntryPlugin.js
    const entryDependency = this.EntryPlugin.createDependency(importFile, { name });
    this.compilation.addEntry(context, entryDependency, entry, (err) => {
      if (err) throw new Error(err);
    });

    this.addedToCompilationEntryNames.push(name);

    return true;
  },

  /**
   * @param {string} name The entry name.
   * @returns {AssetEntryOptions}
   */
  findByName(name) {
    return this.entries.find((entry) => entry.name === name);
  },

  /**
   * @param {Module} module The chunk module.
   * @returns {boolean}
   */
  isEntryModule(module) {
    if (!module.resource) return false;

    const { resource } = parseRequest(module.resource);

    return this.entries.find((entry) => entry.importFile === resource) !== undefined;
  },

  /**
   * Reset entries added not via webpack entry.
   * This is important for webpack watch and serve.
   */
  resetAdditionalEntries() {
    for (const entryName of this.addedToCompilationEntryNames) {
      const index = this.entries.findIndex((entry) => entry.name === entryName);
      this.entries.splice(index, 1);
    }
    this.addedToCompilationEntryNames = [];
  },

  clear() {
    this.entries = [];
    this.addedToCompilationEntryNames = [];
  },
};

module.exports = AssetEntry;
