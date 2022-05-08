const path = require('path');
const { resolveException } = require('./exceptions');
const AssetModule = require('./AssetModule');
const AssetScript = require('./AssetScript');

/**
 * Resource resolver.
 * @singleton
 */
const ResourceResolver = {
  webpackOptionsResolve: {},

  /**
   * @type {string} The context directory to require the file.
   */
  context: '',

  /**
   * @type {string} The the output public path is `webpack.options.output.publicPath`.
   */
  publicPath: '',

  /**
   * The cache is used for all modules. Defined at one time.
   * This cache used by require() as 2nd level if in the cache of current chunk is nothing found.
   * There are paths in the cache where resources from the url were resolved.
   *
   * @property {Set} paths A list of paths where the source file can be found.
   * @property {Map} files The map of request to resolved file. Defined at one time, before compilation.
   */
  globalCache: {
    paths: new Set(),
    files: new Map(),
  },

  /**
   * The cache is used for one chunk only. For each new chunk must be cleaned.
   *
   * @property {Set} paths A list of paths where the source file can be found.
   * @property {Map} files The map of resolved source file to generated asset file.
   */
  chunkCache: {
    paths: new Set(),
    files: new Map(),
  },

  /**
   * @type {Map}
   *  key is rawRequest
   *  value is list of contexts
   */
  moduleCache: new Map(),

  /**
   * @param {string} publicPath
   */
  init({ publicPath }) {
    this.publicPath = publicPath;
    // clean cache for multiple calling of webpack.run(), e.g. by tests, webpack watch or webpack serve
    this.clearChunkCache();
  },

  /**
   * Get the cache id of the resource by context and file.
   *
   * @note Very important to normalize the file.
   *   The file can contain `path/to/../to/file` that is not equal to `path/to/file` for same file.
   *
   * @param {string} context
   * @param {string} file
   * @returns {symbol}
   */
  getId(context, file) {
    return Symbol.for(path.resolve(context, file));
  },

  /**
   * Clear global cache.
   */
  clearCache() {
    this.globalCache.files.clear();
    this.globalCache.paths.clear();
  },

  /**
   * Clear cache of assets used in a chunk.
   * Before processing each chunk, needed to clear the cache
   * to avoid resolving collision and speed up lookups only in the directories of the current chunk.
   */
  clearChunkCache() {
    this.chunkCache.files.clear();
    this.chunkCache.paths.clear();
    this.moduleCache.clear();
  },

  /**
   * Set the current source file, which is the issuer for assets when compiling the source code.
   *
   * @param {string} issuer
   */
  setIssuer(issuer) {
    this.issuer = issuer;
    this.context = path.dirname(issuer);
  },

  /**
   * Add the context and resolved path of the resource to resolve it in require() at render time.
   *
   * @param {Module} module The webpack chunk module.
   * @param {string} assetFile The web path of the asset.
   */
  addToChunkCache(module, assetFile) {
    const request = module.rawRequest;
    const resourceContext = module.resourceResolveData.context;
    const context = resourceContext.issuer ? path.dirname(resourceContext.issuer) : module.context;

    const assetId = this.getId(context, request);
    this.chunkCache.files.set(assetId, assetFile);
    this.chunkCache.paths.add(context);
  },

  /**
   * @param {string} resource The full path of source resource.
   * @param {string} rawRequest The raw request of resource is argument of URL() in css.
   * @param {string} issuer The parent file of the resource.
   */
  addToModuleCache(resource, rawRequest, issuer) {
    if (!this.moduleCache.has(resource)) {
      this.moduleCache.set(resource, {
        issuers: [],
        rawRequest,
        assetFile: undefined,
      });
    }

    this.moduleCache.get(resource).issuers.push(issuer);
  },

  /**
   * @param {string} resource The full path of source resource.
   * @param {string} assetFile The output asset filename.
   */
  setAssetFileInModuleCache(resource, assetFile) {
    if (!this.moduleCache.has(resource)) return;

    this.moduleCache.get(resource).assetFile = assetFile;
  },

  /**
   * @param {string} rawRequest The raw request of resource is argument of URL() in css.
   * @param {string} issuer The parent file of the resource.
   * @return {null|string}
   */
  findAssetFileInModuleCache(rawRequest, issuer) {
    for (const item of this.moduleCache.values()) {
      if (item.rawRequest === rawRequest && item.issuers.indexOf(issuer) >= 0) {
        return item.assetFile;
      }
    }

    return null;
  },

  /**
   * Add resolved path to global cache.
   *
   * @param {string} context The directory of a resolved file.
   */
  addResolvedPath(context) {
    this.globalCache.paths.add(context);
  },

  /**
   * Add resolved file to global cache.
   *
   * @param {string} context The directory of the file.
   * @param {string} request The request of the file.
   * @param {string} resolvedFile The full path of resolved file.
   */
  addResolvedFile(context, request, resolvedFile) {
    let file = path.resolve(context, request);

    if (file !== resolvedFile && !this.globalCache.files.has(request)) {
      this.globalCache.files.set(request, resolvedFile);
    }
  },

  /**
   * Resolve full path of source asset file by raw request.
   *
   * @param {string} rawRequest
   * @returns {string|null}
   */
  resolveSource(rawRequest) {
    const { issuer, moduleCache } = this;
    for (let [sourceFile, item] of moduleCache) {
      if (rawRequest === item.rawRequest && item.issuers.indexOf(issuer) >= 0) {
        return sourceFile;
      }
    }

    return null;
  },

  /**
   * Resolve asset's web path by source file.
   *
   * @param {string} rawRequest The raw request of asset.
   * @returns {null|string}
   */
  resolveAsset(rawRequest) {
    const { issuer, context, globalCache, chunkCache } = this;
    let dir, assetId, assetFile;

    // try to resolve a resource required in pug by absolute path of source file
    let file = rawRequest;
    if (!path.isAbsolute(file)) {
      file = path.resolve(context, rawRequest);
    }
    assetId = this.getId('', file);
    assetFile = chunkCache.files.get(assetId);
    if (assetFile != null) return assetFile;

    // try to resolve a resource required in pug relative by context directory
    for (dir of chunkCache.paths) {
      if (dir.indexOf(context) < 0) continue;
      assetId = this.getId(dir, rawRequest);
      assetFile = chunkCache.files.get(assetId);
      if (assetFile != null) return assetFile;
    }

    // try to resolve ta resource required via url in css
    assetFile = this.findAssetFileInModuleCache(rawRequest, issuer);
    if (assetFile != null) return assetFile;

    // try to resolve a resource imported from `node_modules` via url in css
    for (dir of globalCache.paths) {
      const fullPath = path.resolve(dir, rawRequest);
      assetFile = this.findAssetFileInModuleCache(fullPath, issuer);
      if (assetFile != null) {
        return assetFile;
      }
    }

    // try to resolve the full path of the file and then try to resolve an asset by resolved file
    // this case can be by usage an alias retrieved using webpack resolve.plugins
    const resolvedFile = globalCache.files.get(rawRequest);
    if (resolvedFile != null) {
      assetId = this.getId('', resolvedFile);
      assetFile = chunkCache.files.get(assetId);
    }

    return assetFile;
  },

  /**
   * Require the resource request in the compiled pug or css.
   *
   * @param {string} rawRequest The raw request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(rawRequest) {
    // @import CSS rule is not supported
    if (rawRequest.indexOf('??ruleSet') > 0) resolveException(rawRequest);

    // bypass the asset contained data-URL
    if (AssetModule.isDataUrl(rawRequest)) return rawRequest;

    const self = ResourceResolver;
    const { issuer, context } = self;
    const request = path.resolve(context, rawRequest);

    // bypass the asset/inline as inline SVG
    if (AssetModule.isInlineSvg(issuer, request)) {
      return request;
    }

    // try to resolve full path of asset source file, it can contain alias, possible issuer may be css file
    let assetSource = path.isAbsolute(rawRequest) ? rawRequest : self.resolveSource(rawRequest);
    if (assetSource != null) {
      const dataUrl = AssetModule.getDataUrl(issuer, assetSource);
      if (dataUrl != null) {
        return dataUrl;
      }
    }

    // require resources
    const assetFile = self.resolveAsset(rawRequest);
    if (assetFile) {
      return assetFile;
    }

    // require script in tag <script src=require('./main.js')>
    const file = AssetScript.getResource(rawRequest);
    if (file != null) return file;

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(rawRequest)) {
      return require(request);
    }

    resolveException(rawRequest, issuer);
  },
};

module.exports = ResourceResolver;
