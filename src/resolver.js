const path = require('path');
const { resolveException } = require('./exceptions');

/**
 * URL dependency resolver.
 * @type {{init(*): void, resolve({}): void, resolveInPaths(Set<string>, string): ({file: string, context: string}|null), resolveInBuildInfo({snapshot: {managedFiles: Set<string>, children: Set<{managedFiles: Set<string>}>}}, string): ({file: string, context: string}|null), fs: FileSystem}}
 */
const urlDependencyResolver = {
  fs: null,

  /**
   * @param {FileSystem} fs
   * @param {Object} options The webpack options.
   */
  init(fs, options) {
    this.fs = fs;
  },

  /**
   * @param {Set<string>} files List of parent files/path in whose directory the resolved file can be.
   * @param {string} request The file to be resolved.
   * @returns {null|{file: string, context: string}}
   */
  resolveInPaths(files, request) {
    /** @type {FileSystem} fs */
    const { fs } = this;
    let context, file, tmpFile;
    for (tmpFile of files) {
      context = path.dirname(tmpFile);
      file = path.resolve(context, request);
      if (fs.existsSync(file)) {
        return {
          context,
          file,
        };
      }
    }

    return null;
  },

  /**
   * @param {{snapshot: {managedFiles: Set<string>, children: Set<{managedFiles: Set<string>}>}}} buildInfo
   * @param {string} request The file to be resolved.
   * @returns {null|{file: string, context: string}}
   */
  resolveInBuildInfo(buildInfo, request) {
    const self = this;
    const { snapshot } = buildInfo;
    const { managedFiles, children } = snapshot;
    let result;

    if (managedFiles != null && managedFiles.size > 0) {
      result = self.resolveInPaths(managedFiles, request);
      if (result != null) {
        return result;
      }
    }

    if (children != null && children.size > 0) {
      for (let item of children) {
        const childrenManagedFiles = item.managedFiles;
        if (childrenManagedFiles != null && childrenManagedFiles.size > 0) {
          result = self.resolveInPaths(childrenManagedFiles, request);
          if (result != null) {
            return result;
          }
        }
      }
    }

    return null;
  },

  /**
   * @param {{}} resolveData The Callback Parameter for the hooks beforeResolve of NormalModuleFactory.
   */
  resolve(resolveData) {
    const self = this;
    const fs = self.fs;
    const request = resolveData.request;

    if (!fs.existsSync(path.resolve(resolveData.context, request))) {
      const dependency = resolveData.dependencies[0];

      // TODO: use ModuleGraph.getParentModule(dependency);
      const parentModule = dependency._parentModule || {};
      const buildInfo = parentModule.buildInfo || {};
      const snapshot = buildInfo.snapshot || {};
      const issuers = snapshot.fileTimestamps || snapshot.fileTshs;
      /** @type {string} closest issuer that can import the resource */
      const closestIssuer = issuers != null && issuers.size > 0 ? Array.from(issuers.keys()).pop() : null;
      let context = closestIssuer ? path.dirname(closestIssuer) : resolveData.context;
      let resolvedFile;

      // 1. try to resolve relative path in context or in directory of the closest issuer
      let tmpFile = path.resolve(context, request);
      if (fs.existsSync(tmpFile)) {
        resolvedFile = tmpFile;
      } else {
        // 2. try to resolve in node modules
        let res = self.resolveInBuildInfo(buildInfo, request);
        if (res != null) {
          context = res.context;
          resolvedFile = res.file;
        }
      }

      if (resolvedFile != null) {
        resolveData.request = resolvedFile;
        dependency.request = resolvedFile;
        dependency.userRequest = resolvedFile;
        resourceResolver.addResolvedPath(context);
      }
    }
  },
};

/**
 * Resolve required resources.
 */
const resourceResolver = {
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
   * @return {null|string|*}
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
   * Resolve asset's web path by source file.
   *
   * @param {string} file The asset source file.
   * @returns {null|string}
   */
  resolveAsset(file) {
    const { issuer, context } = this;
    let dir, assetId, assetFile;

    // try to resolve a resource required in pug by absolute path of source file
    if (path.isAbsolute(file)) {
      assetId = this.getId('', file);
      assetFile = this.chunkCache.files.get(assetId);
      if (assetFile != null) return assetFile;
    }

    // try to resolve a resource required in pug relative by context directory
    for (dir of this.chunkCache.paths) {
      if (dir.indexOf(context) < 0) continue;
      assetId = this.getId(dir, file);
      assetFile = this.chunkCache.files.get(assetId);
      if (assetFile != null) return assetFile;
    }

    // try to resolve ta resource required via url in css
    assetFile = this.findAssetFileInModuleCache(file, issuer);
    if (assetFile != null) return assetFile;

    // try to resolve a resource imported from `node_modules` via url in css
    for (dir of this.globalCache.paths) {
      const fullPath = path.resolve(dir, file);
      assetFile = this.findAssetFileInModuleCache(fullPath, issuer);
      if (assetFile != null) {
        return assetFile;
      }
    }

    // try to resolve the full path of the file and then try to resolve an asset by resolved file
    // this case can be by usage an alias retrieved using webpack resolve.plugins
    const resolvedFile = this.globalCache.files.get(file);
    if (resolvedFile != null) {
      assetId = this.getId('', resolvedFile);
      assetFile = this.chunkCache.files.get(assetId);
    }

    return assetFile;
  },

  /**
   * Require the resource request in the compiled pug or css.
   *
   * @param {string} request The request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(request) {
    const self = resourceResolver;

    // bypass the inline data-url, e.g.: data:image/png;base64
    if (request.startsWith('data:')) return request;

    // @import CSS rule is not supported.
    if (request.indexOf('??ruleSet') > 0) resolveException(request);

    // require resources
    const assetFile = self.resolveAsset(request);
    if (assetFile) {
      return assetFile;
    }

    // require script in tag <script src=require('./main.js')>
    const file = self.scripts.getResource(request);
    if (file != null) return file;

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(request)) {
      const fullPath = path.resolve(self.context, request);
      return require(fullPath);
    }

    //return request;
    resolveException(request, self.issuer);
  },
};

module.exports = {
  urlDependencyResolver,
  resourceResolver,
};
