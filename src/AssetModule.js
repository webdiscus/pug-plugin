/**
 * AssetModule singleton.
 */
const AssetModule = {
  files: [],
  index: {},

  /**
   * @param {string} sourceFile
   * @param {string} assetFile
   * @return {string|boolean} return false if the file was already processed else return unique assetFile
   */
  getUniqueFilename(sourceFile, assetFile) {
    const sameAssets = this.files.filter((item) => item.filename === assetFile);
    let uniqueFilename = assetFile;

    if (sameAssets.length > 0) {
      if (sameAssets.find((item) => item.request === sourceFile)) return false;

      let index = '.' + this.index[assetFile]++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid filename extension check, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + index + assetFile.slice(pos);
    } else {
      // start index of same asset filename, eg: styles.1.css
      this.index[assetFile] = 1;
    }

    this.files.push({
      request: sourceFile,
      filename: assetFile,
    });

    return uniqueFilename;
  },

  reset() {
    this.files = [];
  },
};

module.exports = AssetModule;
