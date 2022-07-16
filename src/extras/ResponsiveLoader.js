const vm = require('vm');
const Asset = require('../Asset');
const { parseQuery } = require('../utils');
const { isWin } = require('../config');

const ResponsiveLoader = {
  /**
   * Initialize.
   *
   * @param {{}} compiler The webpack compiler object.
   */
  init(compiler) {
    this.used = null;
    this.compiler = compiler;
  },

  /**
   * @return {boolean}
   */
  isUsed() {
    if (this.used == null) {
      const { rules } = this.compiler.options.module || {};
      this.used = false;

      if (rules) {
        this.used = JSON.stringify(rules).indexOf('"responsive-loader"') > 0;
      }
    }

    return this.used === true;
  },

  /**
   * Get the result of resource processing via `responsive-loader`.
   *
   * Note: in Pug is impossible use `responsive-loader` as object,
   * because a processing happen in a later stage then used result in Pug template.
   *
   * @param {{loaders: []}} module The webpack module of resource.
   * @param {string} issuerFile The source file of issuer,
   * @returns {null | string} The compiled result as string to replace required resource with this result.
   */
  getAsset(module, issuerFile) {
    const searchString = isWin ? '\\node_modules\\responsive-loader\\' : '/node_modules/responsive-loader/';
    const loader = module.loaders.find((item) => item.loader.indexOf(searchString) > 0);

    if (!loader) return null;

    const { resource: sourceFile, rawRequest, buildInfo } = module;
    const query = parseQuery(rawRequest);
    const issuerAssetFile = Asset.findAssetFile(issuerFile);
    let sizes = [];
    let asset = null;

    // sizes from query has prio over options
    if (query.sizes && query.sizes.length > 0) {
      sizes = query.sizes;
    } else if (loader.options && loader.options.sizes) {
      sizes = loader.options.sizes;
    }

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
    if (buildInfo.assetsInfo != null) {
      const assets = Array.from(buildInfo.assetsInfo.keys());
      if (assets.length === 1) {
        asset = Asset.getOutputFile(assets[0], issuerAssetFile);
      } else if (assets.length > 1 && sizes.length > 1) {
        asset = assets.map((item, index) => Asset.getOutputFile(item, issuerAssetFile) + ` ${sizes[index]}w`).join(',');
      }
    }

    return asset;
  },
};

module.exports = ResponsiveLoader;
