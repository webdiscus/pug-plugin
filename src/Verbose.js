const ansis = require('ansis');
const { pluginName } = require('./config');
const { outToConsole, isFunction } = require('./Utils');

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
    `${ansis.black.bgGreen(`[${pluginName}]`)} Compile the entry ${ansis.green(name)}\n` +
      'filename: '.padStart(padWidth) +
      `${
        isFunction(filenameTemplate)
          ? ansis.greenBright`[Function: filename]`
          : ansis.magenta(filenameTemplate.toString())
      }\n` +
      'asset: '.padStart(padWidth) +
      ansis.cyanBright(filename) +
      '\n' +
      'to: '.padStart(padWidth) +
      ansis.cyanBright(outputPath) +
      '\n' +
      'source: '.padStart(padWidth) +
      ansis.cyan(importFile) +
      '\n'
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
    `${ansis.black.bgGreen(`[${pluginName}]`) + ansis.black.bgWhite(` ${header} `)}\n` +
      'asset: '.padStart(padWidth) +
      ansis.cyanBright(assetFile) +
      '\n' +
      'to: '.padStart(padWidth) +
      ansis.cyanBright(outputPath) +
      '\n' +
      'source: '.padStart(padWidth) +
      ansis.cyan(sourceFile) +
      '\n' +
      'from: '.padStart(padWidth) +
      '\n' +
      ansis.magenta('- '.padStart(padWidth) + issuerFiles.join('\n' + '- '.padStart(padWidth))) +
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
      'in: '.padStart(padWidth) +
      ansis.magenta(issuer) +
      '\n' +
      'as: '.padStart(padWidth) +
      ansis.ansi(245)(value) +
      '\n';
  }

  outToConsole(
    `${ansis.black.bgGreen(`[${pluginName}]`) + ansis.black.bgWhite(` ${header} `)}\n` +
      'source: '.padStart(padWidth) +
      ansis.cyan(sourceFile) +
      '\n' +
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
      ansis.ansi(245)(data.cache.dataUrl.slice(0, data.cache.dataUrl.indexOf(',')) + ',...') +
      '\n';
    dataUrlIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      ansis.magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  if (data.inlineSvg) {
    const issuers = Array.from(data.inlineSvg.issuers);
    const attrs = data.cache.svgAttrs;
    let attrsString = '';

    for (let key in attrs) {
      attrsString += ' ' + key + '="' + attrs[key] + '"';
    }

    inlineSvgStr = 'inline SVG: '.padStart(padWidth) + ansis.yellowBright('<svg' + attrsString + '>...</svg>') + '\n';
    inlineSvgIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      ansis.magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  outToConsole(
    `${ansis.black.bgGreen(`[${pluginName}]`) + ansis.black.bgWhite(` ${header} `)}\n` +
      'source: '.padStart(padWidth) +
      ansis.cyan(sourceFile) +
      '\n' +
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
