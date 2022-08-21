/**
 * AssetTrash singleton.
 * Accumulate and remove junk assets from compilation.
 *
 * @singleton
 */
class AssetTrash {
  trash = [];
  commentRegexp = /^\/\*\!.+\.LICENSE\.txt\s*\*\/\s*/;
  commentFileSuffix = '.LICENSE.txt';

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    this.trash = [];
  }

  /**
   * Add a junk asset file to trash.
   *
   * @param {string} file
   */
  add(file) {
    this.trash.push(file);
  }

  /**
   * Remove all trash files from compilation.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  clearCompilation(compilation) {
    this.trash.forEach((file) => {
      compilation.deleteAsset(file);
    });
    this.reset();
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  removeComments(compilation) {
    if (compilation.assets) {
      const { commentRegexp, commentFileSuffix: suffix } = this;
      const { RawSource } = compilation.compiler.webpack.sources;
      const assets = Object.keys(compilation.assets);
      const licenseFiles = assets.filter((file) => file.endsWith(suffix));

      for (let filename of licenseFiles) {
        const sourceFilename = filename.replace(suffix, '');
        const source = compilation.assets[sourceFilename].source();
        compilation.updateAsset(sourceFilename, new RawSource(source.replace(commentRegexp, '')));
        compilation.deleteAsset(filename);
      }
    }
  }
}

module.exports = new AssetTrash();
