const path = require('path');
const { isWin } = require('./config');
const { pathToPosix } = require('./utils');

const Asset = {
  publicPath: '',
  outputPath: '',
  isAutoPublicPath: false,
  isFunctionPublicPath: false,

  files: new Map(),
  fileCounter: new Map(),

  init({ outputPath, publicPath }) {
    this.outputPath = outputPath;
    this.publicPath = publicPath === undefined ? 'auto' : publicPath;
    this.isAutoPublicPath = this.publicPath === 'auto';
    this.isFunctionPublicPath = typeof this.publicPath === 'function';
  },

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    this.files.clear();
    this.fileCounter.clear();
  },

  /**
   * Get the publicPath.
   *
   * @param issuer
   * @return {string|*|string}
   */
  getPublicPath(issuer) {
    if (this.isAutoPublicPath) {
      if (!issuer) return '';

      const issuerFullFilename = path.resolve(this.outputPath, issuer);
      const context = path.dirname(issuerFullFilename);
      const publicPath = path.relative(context, this.outputPath) + '/';

      return isWin ? pathToPosix(publicPath) : publicPath;
    }

    return this.isFunctionPublicPath ? this.publicPath.call(null, {}) : this.publicPath;
  },

  /**
   * Get the output asset file regards the publicPath.
   *
   * @param {string} assetFile
   * @param {string} issuer
   * @return {string}
   */
  getOutputFile(assetFile, issuer) {
    if (this.isAutoPublicPath) {
      if (!issuer) return assetFile;

      const issuerFullFilename = path.resolve(this.outputPath, issuer);
      const context = path.dirname(issuerFullFilename);
      const file = path.posix.join(this.outputPath, assetFile);
      const outputFilename = path.relative(context, file);

      return isWin ? pathToPosix(outputFilename) : outputFilename;
    }

    const publicPath = this.isFunctionPublicPath ? this.publicPath.call(null, {}) : this.publicPath;

    return path.posix.join(publicPath, assetFile);
  },

  /**
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  addFile(sourceFile, assetFile) {
    this.files.set(sourceFile, assetFile);
  },

  /**
   * Find asset file by its source file.
   *
   * @param {string} sourceFile The source file.
   * @return {string|null} The asset file.
   */
  findAssetFile(sourceFile) {
    return this.files.get(sourceFile);
  },

  /**
   * @param {string} sourceFile
   * @param {string} assetFile
   * @return {{isCached: boolean, filename: string}}
   */
  getUniqueFilename(sourceFile, assetFile) {
    if (this.files.has(sourceFile)) {
      return {
        isCached: true,
        filename: this.files.get(sourceFile),
      };
    }

    let uniqueFilename = assetFile;

    if (!this.fileCounter.has(assetFile)) {
      this.fileCounter.set(assetFile, { count: 1 });
    } else {
      const res = this.fileCounter.get(assetFile);
      const uniqId = res.count++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid check of the filename extension, because it is very sensible, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + '.' + uniqId + assetFile.slice(pos);
    }

    this.addFile(sourceFile, uniqueFilename);

    return {
      isCached: false,
      filename: uniqueFilename,
    };
  },
};

module.exports = Asset;
