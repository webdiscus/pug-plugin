const path = require('path');
const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const { isWin } = require('./config');
const { parseRequest, pathToPosix } = require('./utils');

/**
 * AssetScript.
 * @singleton
 */
const AssetScript = {
  //index: 1,
  index: {},
  files: [],

  /**
   * Replace all required source filenames with generating asset filenames.
   * Note: this method must be called in the afterProcessAssets compilation hook.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  replaceSourceFilesInCompilation(compilation) {
    const RawSource = compilation.compiler.webpack.sources.RawSource;
    const usedScripts = new Map();

    // in the content, replace the source script file with the output filename
    for (let asset of this.files) {
      const issuerFile = asset.issuer.filename;

      if (!compilation.assets.hasOwnProperty(issuerFile)) {
        // let's show an original error
        continue;
      }

      // init script cache by current issuer
      if (!usedScripts.has(issuerFile)) {
        usedScripts.set(issuerFile, []);
      }

      const { name, request } = asset;
      const chunkGroup = compilation.namedChunkGroups.get(name);
      if (!chunkGroup) {
        // prevent error when in HMR mode after removing a script in pug
        continue;
      }
      let chunkFiles = chunkGroup.getFiles();
      const content = compilation.assets[issuerFile].source();
      let newContent = content;
      let scriptTags = '';

      // filter only scripts w/o HMR
      chunkFiles = chunkFiles.filter((file) => compilation.assetsInfo.get(file).hotModuleReplacement !== true);
      asset.chunkFiles = chunkFiles;

      // replace source filename with asset filename
      if (chunkFiles.length === 1) {
        const assetFile = Asset.getOutputFile(chunkFiles.values().next().value, issuerFile);
        newContent = content.replace(request, assetFile);
      } else {
        // extract original script tag with all attributes for usage it as template for chunks
        let srcStartPos = content.indexOf(request);
        let srcEndPos = srcStartPos + request.length;
        let tagStartPos = srcStartPos;
        let tagEndPos = srcEndPos;
        while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
        tagEndPos = content.indexOf('</script>', tagEndPos) + 9;

        const tmplScriptStart = content.slice(tagStartPos, srcStartPos);
        const tmplScriptEnd = content.slice(srcEndPos, tagEndPos);

        // generate additional scripts of chunks
        const chunkScripts = usedScripts.get(issuerFile);
        for (let file of chunkFiles) {
          // avoid generate a script of the same split chunk used in different js files required in one pug file,
          // happens when used optimisation.splitChunks
          if (chunkScripts.indexOf(file) < 0) {
            const scriptFile = Asset.getOutputFile(file, issuerFile);
            scriptTags += tmplScriptStart + scriptFile + tmplScriptEnd;
            chunkScripts.push(file);
          }
        }

        // inject generated chunks <script> and replace source file with output filename
        if (scriptTags) {
          newContent = content.slice(0, tagStartPos) + scriptTags + content.slice(tagEndPos);
        }
      }

      compilation.assets[issuerFile] = new RawSource(newContent);
    }
  },

  /**
   * @param {string} request The source file of asset.
   * @param  {string} issuer The issuer of the asset.
   * @return {string | false} return false if the file was already processed else return unique assetFile
   */
  getUniqueName(request, issuer) {
    let { name } = path.parse(request);
    const entry = AssetEntry.findByName(name);
    let uniqueName = name;
    let result = name;

    // the entrypoint name must be unique, if already exists then add index: `main` => `main.1`, etc
    if (entry) {
      if (entry.importFile === request) {
        result = false;
      } else {
        if (!this.index[name]) {
          this.index[name] = 1;
        }
        uniqueName = name + '.' + this.index[name]++;
        result = uniqueName;
      }
    }
    this.add(uniqueName, request, issuer);

    return result;
  },

  /**
   * @param {string} name The unique name of entry point.
   * @param {string} request The required resource file.
   * @param {string} issuer The source file of issuer of the required file.
   */
  add(name, request, issuer) {
    let cachedFile = this.files.find((item) => item.request === request && item.issuer.request === issuer);
    if (cachedFile) {
      // update the name for the script
      // after rebuild by HMR the same request can be generated with other asset name
      cachedFile.name = name;
      cachedFile.chunkFiles = [];
      return;
    }

    this.files.push({
      name,
      request,
      chunkFiles: [],
      issuer: {
        filename: undefined,
        request: issuer,
      },
    });
  },

  /**
   *
   * @param {string} issuer The source file of issuer of the required file.
   * @param {string} filename The asset filename of issuer.
   */
  setIssuerFilename(issuer, filename) {
    for (let item of this.files) {
      if (item.issuer.request === issuer) {
        item.issuer.filename = filename;
      }
    }
  },

  /**
   *
   * @param {string} request
   * @return {boolean}
   */
  has(request) {
    if (isWin) request = pathToPosix(request);
    return this.files.find((item) => item.request === request);
  },

  /**
   * @param {string} request
   * @return {string|null}
   */
  resolveFile(request) {
    const { resource, query } = parseRequest(request);

    // try to resolve resource w/o extension, e.g.:
    // when in Pug used script w/o `.js`, like `script(src=require('Scripts/common.min'))`,
    // then resolve filename `common.min` to `common.min.js`
    return query === 'isScript' ? require.resolve(resource) : null;
  },

  /**
   * Reset before new compilation by webpack watch or serve.
   */
  reset() {
    this.index = {};
    // don't reset files because this cache is used by webpack watch or serve
  },

  /**
   * Clear cache before start of this plugin.
   */
  clear() {
    this.index = {};
    this.files = [];
  },
};

module.exports = AssetScript;
