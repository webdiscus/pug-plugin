class AssetSource {
  data = new Map();

  /**
   * @param {string} file
   * @return {boolean}
   */
  isInline(file) {
    return this.data.has(file);
  }

  /**
   *
   * @param {string} sourceFile
   * @param {string} issuerAssetFile
   */
  add({ sourceFile, issuerAssetFile }) {
    let item = this.data.get(sourceFile);
    if (!item) {
      item = {
        issuers: new Set(),
        source: undefined,
      };
    }

    item.issuers.add(issuerAssetFile);
    this.data.set(sourceFile, item);
  }

  /**
   * @param {string} request
   * @param {string} source
   */
  setSource(request, source) {
    const item = this.data.get(request);
    if (!item) return;

    item.source = source;
    this.data.set(request, item);
  }

  /**
   *
   * @param request
   * @return {any}
   */
  get(request) {
    return this.data.get(request);
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  inlineSource(compilation) {
    if (this.data.size === 0) return;

    const RawSource = compilation.compiler.webpack.sources.RawSource;

    for (let [sourceFile, item] of this.data) {
      const { issuers, source } = item;

      for (const assetFile of issuers) {
        const asset = compilation.assets[assetFile];
        if (!asset) continue;

        let html = asset.source().replace(sourceFile, source);
        compilation.assets[assetFile] = new RawSource(html);
      }
    }
  }
}

module.exports = new AssetSource();
