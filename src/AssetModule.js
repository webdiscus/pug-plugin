const path = require('path');

/**
 * Parse tag attributes in a string.
 *
 * @param {string} string
 * @param {Array<string>} exclude The list of excluded attributes from result.
 * @returns {Object<key: string, value: string>} The parsed attributes as object key:value.
 */
const parseAttributes = (string, exclude = []) => {
  let attrPaars = string.replace(/\n/g, ' ').split('=');
  let keys = [];
  let values = [];
  let attrs = {};

  for (let str of attrPaars) {
    let quoteStartPos = str.indexOf('"');
    let quoteEndPos = str.lastIndexOf('"');

    if (quoteStartPos < 0) {
      keys.push(str.trim());
    } else {
      let value = str.slice(quoteStartPos + 1, quoteEndPos).trim();
      let key = str.slice(quoteEndPos + 1).trim();
      if (value) values.push(value);
      if (key) keys.push(key);
    }
  }

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = values[i];

    if (value !== '' && !exclude.find((item) => key.startsWith(item))) {
      attrs[key] = value;
    }
  }

  return attrs;
};

/**
 * AssetModule.
 * @singleton
 */
const AssetModule = {
  files: [],
  index: {},
  dataUrlAssets: new Map(),
  inlineSvgCache: new Map(),
  inlineSvgAssets: new Map(),
  inlineSvgAssetsSet: new Set(),

  /**
   * @param {string} file
   * @param {string} ext
   * @returns {boolean}
   */
  hasExt(file, ext) {
    return path.extname(file).indexOf(ext) >= 0;
  },

  /**
   * Whether the request is data-URL.
   *
   * @param {string} request The request of asset.
   * @returns {boolean}
   */
  isDataUrl(request) {
    return request.startsWith('data:');
  },

  /**
   * @param {Module} module The webpack chunk module.
   * @returns {boolean}
   */
  isCssModule(module) {
    return module.loaders.find((item) => item.loader.indexOf('css-loader') > 0) != null;
  },

  /**
   * @param {string} issuerFile
   * @param {string} sourceFile
   * @returns {string|undefined}
   */
  getDataUrl(issuerFile, sourceFile) {
    const item = this.dataUrlAssets.get(sourceFile);
    return item != null && item.cache != null && item.issuers.has(issuerFile) ? item.cache.dataUrl : undefined;
  },

  /**
   * @param {string} sourceFile
   * @returns {boolean}
   */
  hasDataUrl(sourceFile) {
    const item = this.dataUrlAssets.get(sourceFile);
    return item != null && item.cache != null;
  },

  /**
   * @param {string} issuerFile The source filename of the issuer.
   * @param {string} sourceFile The source filename of asset.
   */
  addDataUrl(issuerFile, sourceFile) {
    if (!this.dataUrlAssets.has(sourceFile)) {
      this.dataUrlAssets.set(sourceFile, {
        issuers: new Set(),
        cache: undefined,
      });
    }

    const item = this.dataUrlAssets.get(sourceFile);
    item.issuers.add(issuerFile);
  },

  /**
   * @param {string} sourceFile The source filename of asset.
   * @param {string} content The content of data-URL.
   */
  setDataUrlContent(sourceFile, content) {
    const item = this.dataUrlAssets.get(sourceFile);
    if (item) {
      item.cache = { dataUrl: content };
    }
  },

  /**
   * @param {string} sourceFile The source filename of asset.
   * @param {{dataUrl: string}} cache The cached content of data-URL.
   */
  setDataUrlCache(sourceFile, cache) {
    const item = this.dataUrlAssets.get(sourceFile);
    if (item) {
      item.cache = cache;
    }
  },

  /**
   * @param {string} issuerFile
   * @param {string} sourceFile
   * @returns {boolean}
   */
  isInlineSvg(issuerFile, sourceFile) {
    const item = this.inlineSvgAssets.get(sourceFile);
    return item != null && item.cache != null && item.issuers.has(issuerFile);
  },

  /**
   * @param {string} issuerFile The output filename of the issuer.
   * @param {string} sourceFile The source filename of asset.
   */
  addInlineSvg(issuerFile, sourceFile) {
    if (!this.inlineSvgAssets.has(sourceFile)) {
      this.inlineSvgAssets.set(sourceFile, {
        issuers: new Set(),
        assets: new Set(),
        cache: undefined,
      });
    }

    const item = this.inlineSvgAssets.get(sourceFile);
    item.issuers.add(issuerFile);
  },

  /**
   * @param {string} assetFile The output filename of issuer.
   * @param {Module} module The webpack asset module contained the SVG source.
   */
  setInlineSvg(assetFile, module) {
    const sourceFile = module.resource;
    const issuer = module.resourceResolveData.context.issuer;
    let cache = this.inlineSvgCache.get(sourceFile);

    if (!cache) {
      const svgOpenTag = '<svg';
      const svgCloseTag = '</svg>';
      // TODO: possible in future to replace original source (not processed) with source processed via loaders, like svgo
      let svg = module.originalSource().source().toString();
      const svgOpenTagStartPos = svg.indexOf(svgOpenTag);
      const svgCloseTagPos = svg.indexOf(svgCloseTag, svgOpenTagStartPos);
      if (svgOpenTagStartPos > 0) {
        // extract SVG content only, ignore xml tag and comments before SVG tag
        svg = svg.slice(svgOpenTagStartPos, svgCloseTagPos + svgCloseTag.length);
      }

      // parse SVG attributes and extract inner content of SVG
      const svgAttrsStartPos = svgOpenTag.length;
      const svgAttrsEndPos = svg.indexOf('>', svgAttrsStartPos);
      const svgAttrsString = svg.slice(svgAttrsStartPos, svgAttrsEndPos);
      const svgAttrs = parseAttributes(svgAttrsString, ['id', 'version', 'xml', 'xmlns']);
      const innerSVG = svg.slice(svgAttrsEndPos + 1, svgCloseTagPos - svgOpenTagStartPos);

      // encode SVG in data URL for modern browsers
      const dataUrl = 'data:image/svg+xml,' + svg.replace(/\s+/g, ' ').replace(/"/g, `'`).replace(/#/g, '%23');

      // encode SVG in data URL for IE 9-11 (reserved)
      // const dataUrl =
      //   'data:image/svg+xml,' +
      //   svg
      //     .replace(/\s+/g, ' ')
      //     .replace(/"/g, `'`)
      //     .replace(/%/g, '%25')
      //     .replace(/#/g, '%23')
      //     .replace(/{/g, '%7B')
      //     .replace(/}/g, '%7D')
      //     .replace(/</g, '%3C')
      //     .replace(/>/g, '%3E');

      cache = {
        svgAttrs,
        innerSVG,
        dataUrl,
      };
      this.inlineSvgCache.set(sourceFile, cache);
    }

    const item = this.inlineSvgAssets.get(sourceFile);
    if (item) {
      item.issuers.add(issuer);
      item.assets.add(assetFile);
      this.inlineSvgAssetsSet.add(assetFile);
      if (item.cache != null) {
        return;
      }
      item.cache = cache;
    }

    this.setDataUrlCache(sourceFile, cache);
  },

  /**
   * Insert inline SVG in HTML.
   * Replacing a tag containing the svg source file with the svg element.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  insertInlineSvg(compilation) {
    if (this.inlineSvgAssets.size === 0) return;

    const RawSource = compilation.compiler.webpack.sources.RawSource;
    const NL = '\n';
    const excludeTags = ['link'];

    // resulting HTML files
    for (const assetFile of this.inlineSvgAssetsSet) {
      const asset = compilation.assets[assetFile];
      if (!asset) continue;

      let html = asset.source();

      // inline assets in HTML
      for (let [sourceFile, item] of this.inlineSvgAssets) {
        if (!item.assets.has(assetFile)) continue;

        const [filename] = path.basename(sourceFile).split('?', 1);
        const cache = item.cache;

        // replace all asset tags with svg content
        // start replacing in body, ignore head
        let offset = html.indexOf('<body');
        let srcPos;
        while ((srcPos = html.indexOf(sourceFile, offset)) >= 0) {
          // find tag `<img src="sourceFile">` with inline asset
          let tagStartPos = srcPos;
          let tagEndPos = srcPos + sourceFile.length;
          while (tagStartPos >= 0 && html.charAt(--tagStartPos) !== '<') {}
          tagEndPos = html.indexOf('>', tagEndPos);

          // reserved feat: ignore replacing of a tag
          // const tag = html.slice(tagStartPos + 1, html.indexOf(' ', tagStartPos + 3));
          // if (excludeTags.indexOf(tag) >= 0) {
          //   offset = tagEndPos;
          //   continue;
          // }

          // parse image attributes
          let tagAttrsString = html.slice(html.indexOf(' ', tagStartPos), tagEndPos);
          let tagAttrs = parseAttributes(tagAttrsString);
          delete tagAttrs['src'];

          // merge svg attributes with tag attributes
          let attrs = Object.assign({}, cache.svgAttrs, tagAttrs);
          let attrsString = '';
          for (let key in attrs) {
            attrsString += ' ' + key + '="' + attrs[key] + '"';
          }

          const inlineSvg =
            NL + `<!-- inline: ${filename} -->` + NL + '<svg' + attrsString + '>' + cache.innerSVG + '</svg>' + NL;

          offset = tagStartPos + inlineSvg.length;
          html = html.slice(0, tagStartPos) + inlineSvg + html.slice(tagEndPos + 1);
        }
      }

      compilation.assets[assetFile] = new RawSource(html);
    }
  },

  /**
   * @param {string} sourceFile
   * @param {string} assetFile
   * @return {string|boolean} return false if the file was already processed else return unique assetFile
   */
  getUniqueFilename(sourceFile, assetFile) {
    const sameAssets = this.files.filter((item) => item.filename === assetFile);
    let uniqueFilename = assetFile;

    if (sameAssets.length > 0) {
      if (sameAssets.find((item) => item.request === sourceFile)) return false;

      let index = '.' + this.index[assetFile]++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid filename extension check, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + index + assetFile.slice(pos);
    } else {
      // start index of same asset filename, eg: styles.1.css
      this.index[assetFile] = 1;
    }

    this.files.push({
      request: sourceFile,
      filename: assetFile,
    });

    return uniqueFilename;
  },

  reset() {
    this.files = [];
  },
};

module.exports = AssetModule;
