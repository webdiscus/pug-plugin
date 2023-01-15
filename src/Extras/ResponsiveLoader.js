const vm = require('vm');
const Asset = require('../Asset');
const { isWin, parseQuery } = require('../Utils');

class ResponsiveLoader {
  isUsed = false;
  options = null;
  loaderOptions = new Map();
  searchModuleString = '/node_modules/responsive-loader/';

  constructor() {
    // bind this context to the method for using in any context as reference to this method
    this.getAsset = this.getAsset.bind(this);
  }

  /**
   * Initialize.
   *
   * @param {Object} compiler The webpack compiler object.
   */
  init(compiler) {
    const { rules } = compiler.options.module || {};

    this.loaderOptions.clear();
    this.isUsed = false;

    if (rules) this.isUsed = JSON.stringify(rules).indexOf('"responsive-loader"') > 0;
    if (isWin) this.searchModuleString = '\\node_modules\\responsive-loader\\';
  }

  /**
   * Find loader option used in the module.
   * Note: different modules may have their own loader options.
   *
   * @param {Object} module The Webpack module of asset.
   * @return {null|Object} Return loader options if module found otherwise null.
   */
  findModuleLoaderOptions(module) {
    const { rawRequest, loaders } = module;

    if (!this.loaderOptions.has(rawRequest)) {
      const loader = loaders.find((item) => item.loader.indexOf(this.searchModuleString) > 0);

      if (!loader) {
        this.loaderOptions.set(rawRequest, null);
        return null;
      }

      const options = loader.options ? loader.options : {};
      this.loaderOptions.set(rawRequest, options);

      return options;
    }

    return this.loaderOptions.get(rawRequest);
  }

  /**
   * Get the result of resource processing via `responsive-loader`.
   *
   * Note: in the template is impossible use `responsive-loader` as object,
   * because a processing happen in a later stage then used result in template.
   *
   * @param {Object} module The Webpack module of asset.
   * @param {string} issuerFile The source file of issuer,
   * @returns {null|string} The compiled result as string to replace required resource with this result.
   */
  getAsset(module, issuerFile) {
    if (this.isUsed !== true) return null;

    const loaderOptions = this.findModuleLoaderOptions(module);
    if (loaderOptions == null) return null;

    const { resource: sourceFile, rawRequest, buildInfo } = module;
    const issuerAssetFile = Asset.findAssetFile(issuerFile);
    const query = parseQuery(rawRequest);
    let asset = null;
    // the query `sizes` parameter has prio over options
    let sizes = query.sizes && query.sizes.length > 0 ? query.sizes : loaderOptions.sizes || [];

    // return one of image object properties: src, srcSet, width, height
    // but in reality is the `srcSet` property useful
    // note: if no query param `prop` and used param `sizes`, then return value of `srcSet`
    if (query.prop) {
      const prop = query.prop;
      const originalSource = module.originalSource();
      const source = originalSource ? originalSource.source().toString() : null;
      let resultProp = null;

      if (source) {
        const contextObject = vm.createContext({
          __webpack_public_path__: Asset.getPublicPath(issuerAssetFile),
          module: { exports: {} },
        });
        const script = new vm.Script(source, { filename: sourceFile });
        const result = script.runInContext(contextObject);

        if (result && result.hasOwnProperty(prop)) {
          resultProp = result[prop].toString();
        }
      }

      return resultProp;
    }

    // fallback: retrieve all generated assets as coma-separated list
    // get the real filename of the asset by usage a loader for the resource, e.g. `responsive-loader`
    // and add the original asset file to trash to remove it from compilation
    const assets = buildInfo.assetsInfo != null ? Array.from(buildInfo.assetsInfo.keys()) : [];
    if (assets.length === 1) {
      asset = Asset.getOutputFile(assets[0], issuerAssetFile);
    } else if (assets.length > 1 && sizes.length > 1) {
      asset = assets
        .map((assetFile, index) => Asset.getOutputFile(assetFile, issuerAssetFile) + ` ${sizes[index]}w`)
        .join(',');
    }

    return asset;
  }
}

module.exports = new ResponsiveLoader();
