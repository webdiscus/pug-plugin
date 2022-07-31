const path = require('path');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const { resolveException, duplicateScriptWarning, duplicateStyleWarning } = require('./Exceptions');

/**
 * @singleton
 */
class Resolver {
  fs = null;

  /**
   * @type {string} The issuer filename of required the file.
   */
  issuer = '';

  /**
   * @type {string} The context directory of required the file.
   */
  context = '';

  /**
   * The cache of resolved source files. Defined at one time.
   */
  sourceFiles = new Map();

  /**
   * The cache of resolved chunks. For each new chunk must be cleaned.
   */
  chunks = new Map();

  /**
   * The cache of asset filenames used for resolving.
   * Note: same module can have many issuers and can be saved under different asset filenames.
   */
  modules = new Map();

  /**
   * The cache of duplicate scripts and styles.
   */
  duplicates = new Map();

  constructor() {
    // bind this context to the method for using in VM context
    this.require = this.require.bind(this);
  }

  /**
   *
   * @param {FileSystem} fs
   * @param {string} rootContext The Webpack root context path.
   */
  init({ fs, rootContext }) {
    this.fs = fs;
    this.rootContext = rootContext;
  }

  /**
   * Clear caches.
   * This method is called only once, when the plugin is applied.
   */
  clear() {
    this.chunks.clear();
    this.modules.clear();
    this.sourceFiles.clear();
  }

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  reset() {
    this.duplicates.clear();
  }

  /**
   * Generate the unique cache id by request and its context.
   *
   * @param {string} request The request of asset.
   * @param {string} context The asset context or issuer.
   * @returns {symbol}
   */
  getId(request, context) {
    return Symbol.for(request + '|' + context);
  }

  /**
   * Set the current source file, which is the issuer for assets when compiling the source code.
   *
   * @param {string} issuer
   */
  setIssuer(issuer) {
    this.issuer = issuer;
    this.context = path.dirname(issuer);
  }

  /**
   * Add the context and resolved path of the resource to resolve it in require() at render time.
   *
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The web path of the asset.
   * @param {string} issuer The issuer of asset file.
   */
  addChunk(sourceFile, assetFile, issuer = '') {
    const assetId = this.getId(path.resolve(sourceFile), issuer);
    this.chunks.set(assetId, assetFile);
  }

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} rawRequest The raw request of resource is argument of URL() in css.
   * @param {string} issuer The parent file of the resource.
   */
  addModule(sourceFile, rawRequest, issuer) {
    if (!this.modules.has(sourceFile)) {
      this.modules.set(sourceFile, {
        issuers: new Set(),
        rawRequests: new Set(),
        assetFile: undefined,
      });
    }

    const cache = this.modules.get(sourceFile);
    cache.issuers.add(issuer);
    cache.rawRequests.add(rawRequest);
  }

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The output asset filename.
   */
  setAssetFile(sourceFile, assetFile) {
    if (!this.modules.has(sourceFile)) {
      // skip if module is not url() in CSS
      return;
    }

    this.modules.get(sourceFile).assetFile = assetFile;
  }

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {{}} moduleHandler External handler for processing of the asset module.
   */
  setModuleHandler(sourceFile, moduleHandler = null) {
    if (!this.modules.has(sourceFile)) {
      // skip if module is not url() in CSS
      return;
    }

    this.modules.get(sourceFile).moduleHandler = moduleHandler;
  }

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

    if (path.isAbsolute(file) && this.fs.existsSync(file)) return resolvedFile;

    const sourceFileId = this.getId(request, issuer);
    return this.sourceFiles.get(sourceFileId);
  }

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

    if (path.isAbsolute(file) && this.fs.existsSync(file)) return;

    const id = this.getId(request, issuer);
    this.sourceFiles.set(id, sourceFile);
  }

  /**
   * Whether in issuer used duplicate script or style.
   * Note: using duplicate scripts in the same Pug file doesn't make sense, must be used only one file.
   *
   * @param {string} file
   * @param {string} issuer
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
  }

  /**
   * Require the resource request in the compiled pug or css.
   *
   * @param {string} rawRequest The raw request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(rawRequest) {
    const { issuer, context } = this;
    const request = path.resolve(context, rawRequest);

    // @import CSS rule is not supported
    if (rawRequest.indexOf('??ruleSet') > 0) resolveException(rawRequest, issuer);

    // require script in tag <script src=require('./main.js')>, asset filename set via replaceSourceFilesInCompilation()
    const scriptFile = AssetScript.resolveFile(rawRequest);
    if (scriptFile != null) {
      if (this.isDuplicate(scriptFile, issuer)) {
        const filePath = path.relative(this.rootContext, scriptFile);
        const issuerPath = path.relative(this.rootContext, issuer);

        duplicateScriptWarning(filePath, issuerPath);
      }
      return scriptFile;
    }

    // bypass the asset contained data-URL
    if (AssetInline.isDataUrl(rawRequest)) return rawRequest;

    // bypass the asset/inline as inline SVG
    if (AssetInline.isInlineSvg(request, issuer)) return request;

    // resolve resources
    const sourceFile = this.getSourceFile(rawRequest, issuer);
    if (sourceFile != null) {
      const assetId = this.getId(sourceFile, issuer);
      const assetFile = this.chunks.get(assetId);
      if (assetFile != null) {
        if (assetFile.endsWith('.css') && this.isDuplicate(assetFile, issuer)) {
          const filePath = path.relative(this.rootContext, sourceFile);
          const issuerPath = path.relative(this.rootContext, issuer);

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
  }
}

module.exports = new Resolver();
