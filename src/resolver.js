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
   */
  init(fs) {
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
      const issuers = snapshot.fileTimestamps;
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
        // TODO: delete commented code in next version
        // let relativeFile = path.relative(resolveData.context, resolvedFile);
        // if (relativeFile[0] !== '.') {
        //   relativeFile = './' + relativeFile;
        // }
        // resolveData.request = relativeFile;
        // dependency.request = relativeFile;
        // dependency.userRequest = relativeFile;

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
 *
 * @type {{addResolvedPath(string): void, init({publicPath: string}): void, resolveAsset(string): (string|null), webpackOptionsResolve: {}, addToChunkCache({}, string): void, chunkCache: {paths: Set<any>, files: Map<any, any>}, getId(string, string): symbol, require(string): string, clearCache(): void, publicPath: string, addResolvedFile(string, string, string): void, clearChunkCache(): void, context: string, setCurrentContext(string): void, globalCache: {paths: Set<any>, files: Map<any, any>}}}
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
   * @param {string} publicPath
   */
  init({ publicPath }) {
    this.publicPath = publicPath;
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
  },

  /**
   * @param {string} context
   */
  setCurrentContext(context) {
    this.context = context;
  },

  /**
   * Add the context and resolved path of the resource to resolve it in require() at render time.
   *
   * @param {{}} module The chunk module.
   * @param {string} assetFile The web path of the asset.
   */
  addToChunkCache(module, assetFile) {
    const resourceContext = module.resourceResolveData.context;
    const context = resourceContext.issuer ? path.dirname(resourceContext.issuer) : module.context;
    const request = module.rawRequest;

    const assetId = this.getId(context, request);
    this.chunkCache.files.set(assetId, assetFile);
    this.chunkCache.paths.add(context);
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
    let dir, assetId, assetFile;

    // firstly try to find an asset in resolved directories of the chunk
    // this is mostly used case by resolve a required resource in pug
    for (dir of this.chunkCache.paths) {
      assetId = this.getId(dir, file);
      assetFile = this.chunkCache.files.get(assetId);
      if (assetFile != null) {
        return assetFile;
      }
    }

    // secondly try to find an asset in resolved directories of global cache
    // this case can be by resolve a resource from url used in css
    for (dir of this.globalCache.paths) {
      assetId = this.getId(dir, file);
      assetFile = this.chunkCache.files.get(assetId);
      if (assetFile != null) {
        return assetFile;
      }
    }

    // at the end try to resolve the full path of file and then try to resolve an asset by this full path
    // this case can be by usage an alias retrieved using webpack resolve.plugins
    const resolvedFile = this.globalCache.files.get(file);
    if (resolvedFile != null) {
      assetId = this.getId('', resolvedFile);
      assetFile = this.chunkCache.files.get(assetId);
    }

    return assetFile;
  },

  /**
   * Require the resource file in the compiled pug or css.
   *
   * @param {string} file The required file from source directory.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(file) {
    const self = resourceResolver;

    // bypass the inline data-url, e.g.: data:image/png;base64
    if (file.startsWith('data:')) return file;

    // @import CSS rule is not supported.
    if (file.indexOf('??ruleSet') > 0) resolveException(file);

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(file)) {
      const fullPath = path.resolve(self.context, file);
      return require(fullPath);
    }

    const assetFile = self.resolveAsset(file);
    if (assetFile) {
      return path.posix.join(self.publicPath, assetFile);
    }

    resolveException(file);
  },
};

module.exports = {
  urlDependencyResolver,
  resourceResolver,
};
