const path = require('path');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const { resolveException, duplicateScriptWarning, duplicateStyleWarning } = require('./exceptions');
const { pathToPosix } = require('./utils');

/**
 * Resource resolver.
 * @singleton
 */
const ResourceResolver = {
  fs: null,

  webpackOptionsResolve: {},

  /**
   * @type {string} The context directory to require the file.
   */
  context: '',

  /**
   * The cache of resolved source files. Defined at one time.
   */
  sourceFiles: new Map(),

  /**
   * The cache is used for one chunk only. For each new chunk must be cleaned.
   */
  chunkCache: new Map(),

  /**
   * The cache of asset filenames used for resolving.
   */
  moduleCache: new Map(),

  /**
   * The cache of duplicate scripts and styles.
   */
  duplicates: new Map(),

  /**
   *
   * @param {FileSystem} fs
   * @param {string} rootContext The Webpack root context path.
   */
  init({ fs, rootContext }) {
    this.fs = fs;
    this.rootContext = rootContext;
  },

  /**
   * Clear caches.
   * This method is called only once, when the plugin is applied.
   */
  clear() {
    this.chunkCache.clear();
    this.moduleCache.clear();
    this.sourceFiles.clear();
  },

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    this.duplicates.clear();
  },

  /**
   * Generate the unique cache id by request and its context.
   *
   * @param {string} request The request of asset.
   * @param {string} context The asset context or issuer.
   * @returns {symbol}
   */
  getId(request, context) {
    return Symbol.for(request + '|' + context);
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
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The web path of the asset.
   * @param {string} issuer The issuer of asset file.
   */
  addToChunkCache(sourceFile, assetFile, issuer = '') {
    const assetId = this.getId(path.resolve(sourceFile), issuer);
    this.chunkCache.set(assetId, assetFile);
  },

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} rawRequest The raw request of resource is argument of URL() in css.
   * @param {string} issuer The parent file of the resource.
   */
  addToModuleCache(sourceFile, rawRequest, issuer) {
    if (!this.moduleCache.has(sourceFile)) {
      this.moduleCache.set(sourceFile, {
        issuers: new Set(),
        rawRequests: new Set(),
        assetFile: undefined,
      });
    }

    const cache = this.moduleCache.get(sourceFile);
    cache.issuers.add(issuer);
    cache.rawRequests.add(rawRequest);
  },

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The output asset filename.
   */
  setAssetFileInModuleCache(sourceFile, assetFile) {
    if (!this.moduleCache.has(sourceFile)) {
      // skip if module is not url() in CSS
      return;
    }

    this.moduleCache.get(sourceFile).assetFile = assetFile;
  },

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {{}} extras Extra option external loader which handeln the asset.
   */
  setExtrasInModuleCache(sourceFile, extras = null) {
    if (!this.moduleCache.has(sourceFile)) {
      // skip if module is not url() in CSS
      return;
    }

    this.moduleCache.get(sourceFile).extras = extras;
  },

  /**
   * Whether in issuer used duplicate script or style.
   * Note: using duplicate scripts in the same Pug file doesn't make sense, must be used only one file.
   *
   * @param file
   * @param issuer
   * @return {boolean}
   */
  isDuplicate(file, issuer) {
    if (!this.duplicates.has(issuer)) {
      this.duplicates.set(issuer, new Set([file]));
      return false;
    }

    const duplicate = this.duplicates.get(issuer);
    if (duplicate.has(file)) return true;

    duplicate.add(file);
    return false;
  },

  /**
   * Try to resolve full path of asset source file by raw request and issuer.
   *
   * @param {string} request The request of resource.
   * @param {string} issuer The issuer of resource.
   * @return {string} The resolved full path of resource.
   */
  getSourceFile(request, issuer) {
    // normalize request, e.g. the relative `path/to/../to/file` path to absolute `path/to/file`
    const resolvedFile = path.resolve(this.context, request);
    const [file] = resolvedFile.split('?', 1);
    const fs = this.fs;

    if (path.isAbsolute(file) && fs.existsSync(file)) return resolvedFile;

    const sourceFileId = this.getId(request, issuer);
    return this.sourceFiles.get(sourceFileId);
  },

  /**
   * Add resolved source file to cache.
   *
   * @param {string} sourceFile The resolved full path of resource.
   * @param {string} request The request of resource.
   * @param {string} issuer The issuer of resource.
   */
  addSourceFile(sourceFile, request, issuer) {
    if (sourceFile === path.resolve(request)) return;

    const [file] = request.split('?', 1);
    const fs = this.fs;

    if (path.isAbsolute(file) && fs.existsSync(file)) return;

    const id = this.getId(request, issuer);
    this.sourceFiles.set(id, sourceFile);
  },

  /**
   * Require the resource request in the compiled pug or css.
   *
   * @param {string} rawRequest The raw request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(rawRequest) {
    const self = ResourceResolver;
    const { issuer, context } = self;
    const request = path.resolve(context, rawRequest);

    // @import CSS rule is not supported
    if (rawRequest.indexOf('??ruleSet') > 0) resolveException(rawRequest, issuer);

    // require script in tag <script src=require('./main.js')>, asset filename set via replaceSourceFilesInCompilation()
    const scriptFile = AssetScript.resolveFile(rawRequest);
    if (scriptFile != null) {
      if (self.isDuplicate(scriptFile, issuer)) {
        const filePath = path.relative(self.rootContext, scriptFile);
        const issuerPath = path.relative(self.rootContext, issuer);

        duplicateScriptWarning(filePath, issuerPath);
      }
      return scriptFile;
    }

    // bypass the asset contained data-URL
    if (AssetInline.isDataUrl(rawRequest)) return rawRequest;

    // bypass the asset/inline as inline SVG
    if (AssetInline.isInlineSvg(request, issuer)) return request;

    // resolve resources
    const sourceFile = self.getSourceFile(rawRequest, issuer);
    if (sourceFile != null) {
      const assetId = self.getId(sourceFile, issuer);
      const assetFile = self.chunkCache.get(assetId);
      if (assetFile != null) {
        if (assetFile.endsWith('.css') && self.isDuplicate(assetFile, issuer)) {
          const filePath = path.relative(self.rootContext, sourceFile);
          const issuerPath = path.relative(self.rootContext, issuer);

          duplicateStyleWarning(filePath, issuerPath);
        }
        return assetFile;
      }

      // try to resolve inline data url
      const dataUrl = AssetInline.getDataUrl(sourceFile, issuer);
      if (dataUrl != null) return dataUrl;
    }

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(rawRequest)) return require(request);

    resolveException(rawRequest, issuer);
  },
};

module.exports = ResourceResolver;
