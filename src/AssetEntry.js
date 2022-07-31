const path = require('path');
const { isFunction, parseRequest } = require('./Utils');

/**
 * @singleton
 */
class AssetEntry {
  /** @type {Map<string, AssetEntryOptions>} */
  entryMap = new Map();
  compilationEntryNames = new Set();

  compilation = null;
  EntryPlugin = null;

  /**
   * @param {string} outputPath The Webpack output path.
   */
  setWebpackOutputPath(outputPath) {
    this.webpackOutputPath = outputPath;
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  setCompilation(compilation) {
    this.compilation = compilation;
    this.EntryPlugin = compilation.compiler.webpack.EntryPlugin;
  }

  /**
   * Clear caches.
   * This method is called only once, when the plugin is applied.
   */
  clear() {
    this.entryMap.clear();
  }

  /**
   * @param {string} name The entry name.
   * @returns {AssetEntryOptions}
   */
  get(name) {
    return this.entryMap.get(name);
  }

  /**
   * @param {{}} entry The webpack entry object.
   * @param {AssetEntryOptions} assetEntryOptions
   */
  add(entry, assetEntryOptions) {
    const { name, outputPath, filenameTemplate } = assetEntryOptions;
    const relativeOutputPath = path.isAbsolute(outputPath)
      ? path.relative(this.webpackOutputPath, outputPath)
      : outputPath;

    entry.filename = (pathData, assetInfo) => {
      if (!assetEntryOptions.filename) {
        Object.defineProperty(assetEntryOptions, 'filename', {
          set(filename) {
            // replace the setter with value of resolved filename
            delete this.filename;
            this.filename = filename;
          },
        });
      }

      let filename = isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
      if (relativeOutputPath) {
        filename = path.posix.join(relativeOutputPath, filename);
      }

      return filename;
    };

    this.entryMap.set(name, assetEntryOptions);
  }

  /**
   * Add a script to webpack compilation.
   *
   * @param {string} name
   * @param {string} importFile
   * @param {string} filenameTemplate
   * @param {string} context
   * @param {string} issuer
   * @return {boolean}
   */
  addToCompilation({ name, importFile, filenameTemplate, context, issuer }) {
    // skip duplicate entries
    if (this.inEntry(name, importFile)) return false;

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
      outputPath: this.webpackOutputPath,
      postprocess: undefined,
      extract: undefined,
      verbose: false,
    };

    this.add(entry, assetEntryOptions);
    this.compilationEntryNames.add(name);

    // adds the entry of the script from pug to the compilation
    // see reference: node_modules/webpack/lib/EntryPlugin.js
    const entryDependency = this.EntryPlugin.createDependency(importFile, { name });
    this.compilation.addEntry(context, entryDependency, entry, (err) => {
      if (err) throw new Error(err);
    });

    return true;
  }

  /**
   * Whether the entry is not unique.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   */
  isNotUnique(name, file) {
    const entry = this.entryMap.get(name);
    return entry && entry.importFile !== file;
  }

  /**
   * Whether the file in the entry already exists.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   */
  inEntry(name, file) {
    const entry = this.entryMap.get(name);
    return entry && entry.importFile === file;
  }

  /**
   * Whether the file is in an entry.
   *
   * @param {string} file The source file.
   * @return {boolean}
   */
  hasFile(file) {
    const { resource } = parseRequest(file);
    const entries = this.entryMap.entries();
    for (let [name, entry] of entries) {
      if (entry.importFile === resource) return true;
    }
    return false;
  }

  /**
   * Remove entries added not via webpack entry.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    for (const entryName of this.compilationEntryNames) {
      this.entryMap.delete(entryName);
    }
    this.compilationEntryNames.clear();
  }
}

module.exports = new AssetEntry();
