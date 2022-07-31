const path = require('path');
const { isWin, pathToPosix } = require('./Utils');

/**
 * @singleton
 */
class Asset {
  publicPath = '';
  outputPath = '';
  isAutoPublicPath = false;
  isFunctionPublicPath = false;

  files = new Map();
  fileIndex = {};

  init({ outputPath, publicPath }) {
    this.outputPath = outputPath;
    this.publicPath = publicPath === undefined ? 'auto' : publicPath;
    this.isFunctionPublicPath = typeof publicPath === 'function';
    this.isAutoPublicPath = this.publicPath === 'auto';
  }

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    this.fileIndex = {};
    this.files.clear();
  }

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
  }

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
  }

  /**
   * Add resolved module asset.
   * This asset can be as issuer for other resource assets.
   *
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  add(sourceFile, assetFile) {
    this.files.set(sourceFile, assetFile);
  }

  /**
   * Find asset file by its source file.
   *
   * @param {string} sourceFile The source file.
   * @return {string|null} The asset file.
   */
  findAssetFile(sourceFile) {
    return this.files.get(sourceFile);
  }

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

    if (!this.fileIndex[assetFile]) {
      this.fileIndex[assetFile] = 1;
    } else {
      const uniqId = this.fileIndex[assetFile]++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid check of the filename extension, because it is very sensible, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + '.' + uniqId + assetFile.slice(pos);
    }

    this.add(sourceFile, uniqueFilename);

    return {
      isCached: false,
      filename: uniqueFilename,
    };
  }
}

module.exports = new Asset();
