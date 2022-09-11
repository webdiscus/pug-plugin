const { pluginName } = require('./config');
const { outToConsole, isFunction } = require('./Utils');
const { green, greenBright, cyan, cyanBright, magenta, yellowBright, black, ansi } = require('ansis/colors');
const grayBright = ansi(245);

// width of labels in first column
const padWidth = 12;

const verboseEntry = ({ name, importFile, outputPath, filename, filenameTemplate }) => {
  /**
   * @param {string} name
   * @param {string} importFile
   * @param {string} outputPath
   * @param {string} filename
   * @param {string|Function} filenameTemplate
   */
  outToConsole(
    `${black.bgGreen`[${pluginName}]`} Compile the entry ${green(name)}\n` +
      'filename: '.padStart(padWidth) +
      `${isFunction(filenameTemplate) ? greenBright`[Function: filename]` : magenta(filenameTemplate.toString())}\n` +
      'asset: '.padStart(padWidth) +
      `${cyanBright(filename)}\n` +
      'to: '.padStart(padWidth) +
      `${cyanBright(outputPath)}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(importFile)}\n`
  );
};

/**
 * @param {Map} issuers
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 */
const verboseExtractResource = ({ issuers, sourceFile, outputPath, assetFile }) => {
  if (assetFile) {
    const header = 'Extract Resource';
    verboseExtractModule({ issuers, sourceFile, outputPath, assetFile, header });
    return;
  }

  verboseResolveResource({ issuers, sourceFile });
};

/**
 * @param {Map} issuers
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 * @param {string} header
 */
const verboseExtractModule = ({ issuers, sourceFile, outputPath, assetFile, header }) => {
  const issuerFiles = Array.from(issuers.keys());

  if (!header) header = 'Extract Module';

  outToConsole(
    `${black.bgGreen`[${pluginName}]`}${black.bgWhite` ${header} `}\n` +
      'asset: '.padStart(padWidth) +
      `${cyanBright(assetFile)}\n` +
      'to: '.padStart(padWidth) +
      `${cyanBright(outputPath)}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      'from: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuerFiles.join('\n' + '- '.padStart(padWidth))) +
      '\n'
  );
};

/**
 * @param {Map<string, string>} issuers
 * @param {string} sourceFile
 */
const verboseResolveResource = ({ issuers, sourceFile }) => {
  const header = 'Resolve Resource';
  let issuersStr = '';

  for (let [issuer, asset] of issuers) {
    let value = asset && asset.startsWith('data:') ? asset.slice(0, asset.indexOf(',')) + ',...' : asset;
    issuersStr +=
      'in: '.padStart(padWidth) + `${magenta(issuer)}\n` + 'as: '.padStart(padWidth) + `${grayBright(value)}\n`;
  }

  outToConsole(
    `${black.bgGreen`[${pluginName}]`}${black.bgWhite` ${header} `}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      issuersStr
  );
};

/**
 * @param {string} sourceFile
 * @param {Object} data
 */
const verboseExtractInlineResource = ({ sourceFile, data }) => {
  const header = 'Resolve Inline Resource';
  let inlineSvgStr = '';
  let inlineSvgIssuersStr = '';
  let dataUrlStr = '';
  let dataUrlIssuersStr = '';

  if (data.dataUrl) {
    const issuers = Array.from(data.dataUrl.issuers);

    dataUrlStr =
      'data URL: '.padStart(padWidth) +
      grayBright(data.cache.dataUrl.slice(0, data.cache.dataUrl.indexOf(',')) + ',...') +
      '\n';

    dataUrlIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  if (data.inlineSvg) {
    const issuers = Array.from(data.inlineSvg.issuers);
    const attrs = data.cache.svgAttrs;
    let attrsString = '';

    for (let key in attrs) {
      attrsString += ' ' + key + '="' + attrs[key] + '"';
    }

    inlineSvgStr = 'inline SVG: '.padStart(padWidth) + yellowBright('<svg' + attrsString + '>...</svg>') + '\n';
    inlineSvgIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  outToConsole(
    `${black.bgGreen`[${pluginName}]`}${black.bgWhite` ${header} `}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      dataUrlStr +
      dataUrlIssuersStr +
      inlineSvgStr +
      inlineSvgIssuersStr
  );
};

module.exports = {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
  verboseExtractInlineResource,
};
