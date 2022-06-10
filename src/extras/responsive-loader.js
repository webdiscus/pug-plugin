const vm = require('vm');
const path = require('path');
const { parseQuery } = require('../utils');

const ResponsiveLoader = {
  /**
   * Initialize.
   *
   * @param {{}} compiler The webpack compiler object.
   */
  init(compiler) {
    this.used = null;
    this.publicPath = '/';
    this.compiler = compiler;

    if (compiler.options.output && compiler.options.output.publicPath) {
      this.publicPath = compiler.options.output.publicPath;
    }
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
   * @param {{}} module The webpack module of resource.
   * @returns {null | string} The compiled result as string to replace required resource with this result.
   */
  getAsset(module) {
    const loader = module.loaders.find((item) => item.loader.indexOf('/node_modules/responsive-loader/') > 0);

    if (!loader) return null;

    const { publicPath } = this;
    const { sourceFile, rawRequest, buildInfo } = module;

    const query = parseQuery(rawRequest);
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

      if (source) {
        const contextObject = vm.createContext({
          __webpack_public_path__: publicPath,
          module: { exports: {} },
        });
        const script = new vm.Script(source, { filename: sourceFile });
        const result = script.runInContext(contextObject);

        if (result && result.hasOwnProperty(prop)) {
          asset = result[prop].toString();
        }
      }
    }

    // fallback: retrieve all generated assets as coma-separated list
    // get the real filename of the asset by usage a loader for the resource, e.g. `responsive-loader`
    // and add the original asset file to trash to remove it from compilation
    else if (buildInfo.assetsInfo != null) {
      const assets = Array.from(buildInfo.assetsInfo.keys());
      if (assets.length === 1) {
        asset = path.posix.join(publicPath, assets[0]);
      } else if (assets.length > 1 && sizes.length > 1) {
        asset = assets.map((item, index) => path.posix.join(publicPath, item) + ` ${sizes[index]}w`).join(',');
      }
    }

    return asset;
  },
};

module.exports = ResponsiveLoader;
