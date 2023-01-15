const path = require('path');
const Asset = require('./Asset');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const AssetSource = require('./AssetSource');
const { duplicateScriptWarning, duplicateStyleWarning } = require('./Messages/Warning');
const { resolveException } = require('./Messages/Exception');

class Resolver {
  static fs = null;

  /**
   * @type {string} The issuer filename of required the file.
   */
  static issuerFile = '';

  /**
   * @type {string} The issuer request of required the file.
   */
  static issuerRequest = '';

  /**
   * @type {string} The output filename of current entry point.
   */
  static entryAsset = '';

  /**
   * @type {string} The context directory of required the file.
   */
  static context = '';

  /**
   * The cache of resolved source files. Defined at one time.
   *
   * @type {Map<string, Map<string, string>>}
   */
  static sourceFiles = new Map();

  /**
   * The data of assets sources and issuers. Used for resolving output assets.
   * For each new chunk must be cleaned.
   * Note: same module can have many issuers and can be saved under different asset filenames.
   *
   * @type {Map<string, {issuers:Map, originalAssetFile:string, moduleHandler?:Function<originalAssetFile:string, issuer:string>}>}
   */
  static data = new Map();

  /**
   * The cache of duplicate scripts and styles.
   */
  static duplicates = new Map();

  /**
   * @param {FileSystem} fs
   * @param {string} rootContext The Webpack root context path.
   */
  static init({ fs, rootContext }) {
    this.fs = fs;
    this.rootContext = rootContext;

    // bind this context to the method for using in VM context
    this.require = this.require.bind(this);
  }

  /**
   * Clear caches.
   * This method is called only once, when the plugin is applied.
   */
  static clear() {
    this.data.clear();
    this.sourceFiles.clear();
  }

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    // reset outdated assets after rebuild via webpack dev server
    // note: new filenames are generated on the fly in the this.resolveAsset() method
    this.data.forEach((item) => item.issuers.clear());
    this.duplicates.clear();
  }

  /**
   * Set the current source file, which is the issuer for assets when compiling the source code.
   *
   * @param {string} issuer The issuer request.
   * @param {string} entryAsset The current entry point.
   */
  static setIssuer(issuer, entryAsset) {
    const [file] = issuer.split('?', 1);
    this.issuerFile = file;
    this.issuerRequest = issuer;
    this.context = path.dirname(file);
    this.entryAsset = entryAsset;
  }

  /**
   * Add the context and resolved path of the resource to resolve it in require() at render time.
   *
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The original asset filename generated by Webpack, relative by output path.
   * @param {string} issuer The issuer of asset file.
   */
  static addAsset(sourceFile, assetFile, issuer) {
    sourceFile = path.resolve(sourceFile);

    let item = this.data.get(sourceFile);
    if (!item) {
      this.data.set(sourceFile, {
        issuers: new Map([[issuer, undefined]]),
        originalAssetFile: assetFile,
      });
      return;
    }

    // don't override already resolved assets
    if (!item.issuers.has(issuer)) {
      item.issuers.set(issuer, undefined);
    }
    if (assetFile != null) item.originalAssetFile = assetFile;
  }

  /**
   * Add the resolved output asset file.
   *
   * @param {string} sourceFile The full path of source asset file.
   * @param {string} assetFile The resolved output asset filename, given the auto public path.
   * @param {string} issuer The issuer of asset file.
   */
  static addResolvedAsset(sourceFile, assetFile, issuer) {
    sourceFile = path.resolve(sourceFile);

    let item = this.data.get(sourceFile);
    if (!item) {
      this.data.set(sourceFile, {
        issuers: new Map([[issuer, assetFile]]),
      });
      return;
    }
    item.issuers.set(issuer, assetFile);
  }

  /**
   * @param {string} sourceFile The full path of source asset file.
   * @param {Object} moduleHandler External handler for processing of the asset module.
   */
  static setModuleHandler(sourceFile, moduleHandler = null) {
    let item = this.data.get(sourceFile);
    if (item) {
      item.moduleHandler = moduleHandler;
    }
  }

  /**
   * Resolve full path of asset source file by raw request and issuer.
   *
   * @param {string} rawRequest The raw request of resource.
   * @param {string} issuer The issuer of resource.
   * @return {string|null} The resolved full path of resource.
   */
  static getSourceFile(rawRequest, issuer) {
    let sourceFile = this.sourceFiles.get(issuer)?.get(rawRequest);
    if (sourceFile) return sourceFile;

    // normalize request, e.g. the relative `path/to/../to/file` path to absolute `path/to/file`
    sourceFile = path.resolve(this.context, rawRequest);
    const [file] = sourceFile.split('?', 1);

    if (rawRequest.startsWith(this.context) || this.fs.existsSync(file)) {
      this.addSourceFile(sourceFile, rawRequest, issuer);
      return sourceFile;
    }

    return null;
  }

  /**
   * Add resolved source file to data.
   *
   * @param {string} sourceFile The resolved full path of resource.
   * @param {string} rawRequest The rawRequest of resource.
   * @param {string} issuer The issuer of resource.
   */
  static addSourceFile(sourceFile, rawRequest, issuer) {
    let item = this.sourceFiles.get(issuer);
    if (item == null) {
      this.sourceFiles.set(issuer, new Map([[rawRequest, sourceFile]]));
    } else {
      item.set(rawRequest, sourceFile);
    }
  }

  /**
   * Whether in issuer used duplicate script or style.
   * Note: using duplicate scripts in the same template file doesn't make sense, must be used only one file.
   *
   * @param {string} file
   * @param {string} issuer
   * @return {boolean}
   */
  static isDuplicate(file, issuer) {
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
   * Resolve output asset filename, given the auto public path.
   *
   * @param {string} sourceFile The resolved full path of resource.
   * @param {string} issuer The issuer of resource.
   * @param {string|null} entryAsset
   * @return {string|null}
   */
  static resolveAsset(sourceFile, issuer, entryAsset) {
    const item = this.data.get(sourceFile);
    if (!item) return null;

    let assetFile = item.issuers.get(issuer);
    if (assetFile && !entryAsset) return assetFile;

    const { originalAssetFile, moduleHandler } = item;
    let assetOutputFile;

    if (originalAssetFile != null) {
      // normalize output asset files
      if (AssetInline.isDataUrl(originalAssetFile)) {
        assetOutputFile = originalAssetFile;
      } else {
        const issuerAssetFile = entryAsset || Asset.findAssetFile(issuer);
        if (issuerAssetFile) {
          assetOutputFile = Asset.getOutputFile(originalAssetFile, issuerAssetFile);
        }
      }
    } else if (moduleHandler != null) {
      // normalize output asset files processed via external loader, e.g. `responsive-loader`
      assetOutputFile = moduleHandler(originalAssetFile, issuer);
    }

    if (assetOutputFile != null) {
      item.issuers.set(issuer, assetOutputFile);
    }

    return assetOutputFile;
  }

  /**
   * Require the resource request in the compiled template or CSS.
   *
   * @param {string} rawRequest The raw request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  static require(rawRequest) {
    const { entryAsset, issuerFile, issuerRequest, context } = this;
    const request = path.resolve(context, rawRequest);

    // @import CSS rule is not supported
    if (rawRequest.indexOf('??ruleSet') > 0) {
      resolveException(rawRequest, issuerRequest);
    }

    // require script in tag <script src=require('./main.js')>, set an asset filename via replaceSourceFilesInCompilation()
    const scriptFile = AssetScript.resolveFile(rawRequest);

    if (scriptFile != null) {
      if (this.isDuplicate(scriptFile, issuerRequest)) {
        const filePath = path.relative(this.rootContext, scriptFile);
        const issuerPath = path.relative(this.rootContext, issuerRequest);
        duplicateScriptWarning(filePath, issuerPath);
      }

      return scriptFile;
    }

    // bypass the asset contained data-URL
    if (AssetInline.isDataUrl(rawRequest)) return rawRequest;

    // bypass the inline CSS
    if (AssetSource.isInline(rawRequest)) return rawRequest;

    // bypass the asset/inline as inline SVG
    if (AssetInline.isInlineSvg(request, issuerFile)) return request;

    // resolve resources
    const sourceFile = this.getSourceFile(rawRequest, issuerFile);

    if (sourceFile != null) {
      const inline = AssetSource.isInline(issuerRequest);
      const assetFile = this.resolveAsset(sourceFile, issuerRequest, inline ? entryAsset : null);

      if (assetFile != null) {
        if (assetFile.endsWith('.css') && this.isDuplicate(assetFile, issuerRequest)) {
          const filePath = path.relative(this.rootContext, sourceFile);
          const issuerPath = path.relative(this.rootContext, issuerRequest);
          duplicateStyleWarning(filePath, issuerPath);
        }

        return assetFile;
      }

      // try to resolve inline data url
      const dataUrl = AssetInline.getDataUrl(sourceFile, issuerFile);
      if (dataUrl != null) return dataUrl;
    }

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(rawRequest)) return require(request);

    resolveException(rawRequest, issuerRequest);
  }
}

module.exports = Resolver;
