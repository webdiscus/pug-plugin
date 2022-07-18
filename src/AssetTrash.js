/**
 * AssetTrash singleton.
 * Accumulate and remove junk assets from compilation.
 */
const AssetTrash = {
  trash: [],

  /**
   * Clear caches before start of this plugin.
   */
  reset() {
    this.trash = [];
  },

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
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  removeComments(compilation) {
    if (compilation.assets) {
      const commentRegex = /^\/\*\!.+\.LICENSE\.txt\s*\*\/\s*/;
      const suffix = '.LICENSE.txt';
      const { RawSource } = compilation.compiler.webpack.sources;
      const assets = Object.keys(compilation.assets);
      const licenseFiles = assets.filter((file) => file.endsWith(suffix));

      for (let filename of licenseFiles) {
        const sourceFilename = filename.replace(suffix, '');
        const source = compilation.assets[sourceFilename].source();
        compilation.updateAsset(sourceFilename, new RawSource(source.replace(commentRegex, '')));
        compilation.deleteAsset(filename);
      }
    }
  },
};

module.exports = AssetTrash;
