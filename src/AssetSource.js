class AssetSource {
  static data = new Map();

  /**
   * @param {string} file
   * @return {boolean}
   */
  static isInline(file) {
    return this.data.has(file);
  }

  /**
   * @param {string} sourceFile
   */
  static add(sourceFile) {
    if (!this.data.has(sourceFile)) {
      this.data.set(sourceFile, {
        issuers: new Map(),
      });
    }
  }

  /**
   * @param {string} sourceFile
   * @param {string} entryAsset
   * @param {string} source
   */
  static setSource(sourceFile, entryAsset, source) {
    const item = this.data.get(sourceFile);
    if (!item) return;

    item.issuers.set(entryAsset, source);
    this.data.set(sourceFile, item);
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static inlineSource(compilation) {
    if (this.data.size === 0) return;

    const RawSource = compilation.compiler.webpack.sources.RawSource;

    for (let [sourceFile, item] of this.data) {
      for (let [assetFile, source] of item.issuers) {
        const asset = compilation.assets[assetFile];
        if (!asset) continue;

        let html = asset.source().replace(sourceFile, source);
        compilation.assets[assetFile] = new RawSource(html);
      }
    }
  }
}

module.exports = AssetSource;
