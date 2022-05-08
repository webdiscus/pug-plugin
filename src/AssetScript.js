const path = require('path');
const AssetEntry = require('./AssetEntry');
const { parseRequest } = require('./utils');

/**
 * AssetScript.
 * @singleton
 */
const AssetScript = {
  files: [],
  index: 1,

  /**
   * Replace all required source filenames with generating asset filenames.
   * Note: this method must be called in the afterProcessAssets compilation hook.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} outputPublicPath The output public path.
   */
  replaceSourceFilesInCompilation(compilation, outputPublicPath) {
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

      const { request: sourceFile } = asset;
      const chunkGroup = compilation.namedChunkGroups.get(asset.name);
      if (!chunkGroup) {
        // prevent error when in HRM mode after removing a script in pug
        continue;
      }
      const chunkFiles = chunkGroup.getFiles();
      const content = compilation.assets[issuerFile].source();
      let newContent = content;
      let scriptTags = '';

      asset.chunkFiles = chunkFiles;

      // replace source filename with asset filename
      if (chunkFiles.length === 1) {
        const assetFile = path.posix.join(outputPublicPath, chunkFiles.values().next().value);
        newContent = content.replace(sourceFile, assetFile);
      } else {
        // generate additional scripts of chunks
        const chunkScripts = usedScripts.get(issuerFile);
        for (let file of chunkFiles) {
          // avoid generate a script of the same split chunk used in different js files required in one pug file,
          // happens when used optimisation.splitChunks
          if (chunkScripts.indexOf(file) < 0) {
            const assetsInfo = compilation.assetsInfo.get(file);
            if (assetsInfo.hotModuleReplacement === true) continue;

            const scriptFile = path.posix.join(outputPublicPath, file);
            scriptTags += `<script src="${scriptFile}"></script>`;
            chunkScripts.push(file);
          }
        }

        // inject generated chunks <script> and replace source file with output filename
        if (scriptTags) {
          const srcPos = content.indexOf(sourceFile);
          let tagStartPos = srcPos;
          let tagEndPos = srcPos + sourceFile.length;
          while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
          tagEndPos = content.indexOf('</script>', tagEndPos) + 9;
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
        uniqueName = name + '.' + this.index++;
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
      // after rebuild by hmr the same request can be generated with other asset name
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

  has(request) {
    return this.files.find((item) => item.request === request);
  },

  getResource(request) {
    const { resource, query } = parseRequest(request);

    return query === 'isScript' ? resource : null;
  },

  /**
   * Reset cache before new compilation by webpack watch or serve.
   */
  reset() {
    // don't reset files because this cache is used by webpack watch or serve
    //this.files = [];
    this.index = 1;
  },

  /**
   * Clear caches before start of this plugin.
   */
  clear() {
    this.files = [];
    this.index = 1;
  },
};

module.exports = AssetScript;
