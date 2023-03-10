const { pluginName } = require('../config');
const { pathRelativeByPwd, outToConsole, isFunction } = require('../Utils');
const {
  green,
  greenBright,
  cyan,
  cyanBright,
  magenta,
  yellowBright,
  black,
  gray,
  ansi,
  yellow,
} = require('ansis/colors');
const grayBright = ansi(245);

const header = black.bgGreen`[${pluginName}]`;

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
    `${header} Compile the entry ${green(name)}\n` +
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
 * @param {string} title
 */
const verboseExtractModule = ({ issuers, sourceFile, outputPath, assetFile, title }) => {
  const issuerFiles = Array.isArray(issuers) ? issuers : Array.from(issuers.keys());

  if (!title) title = 'Extract Module';

  const assetsStr = !Array.isArray(assetFile)
    ? 'asset: '.padStart(padWidth) + `${cyanBright(assetFile)}`
    : 'asset chunks: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + assetFile.join('\n' + '- '.padStart(padWidth)));

  const issuersStr =
    issuerFiles.length === 1
      ? magenta(issuerFiles[0])
      : '\n' + magenta('- '.padStart(padWidth) + issuerFiles.join('\n' + '- '.padStart(padWidth)));

  outToConsole(
    `${header}${black.bgWhite` ${title} `}\n` +
      assetsStr +
      '\n' +
      'to: '.padStart(padWidth) +
      `${cyanBright(outputPath)}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      'from: '.padStart(padWidth) +
      issuersStr +
      '\n'
  );
};

/**
 * @param {Object} entity
 * @param {string} outputPath
 */
const verboseExtractScript = ({ entity, outputPath }) => {
  const title = 'Extract JS';
  let { file, inline, issuers } = entity;
  let str = `${header}${black.bgWhite` ${title} `}\n`;

  file = pathRelativeByPwd(file);
  outputPath = pathRelativeByPwd(outputPath);

  if (inline) {
    str += `inline: `.padStart(padWidth) + `${greenBright`yes`}` + '\n';
  }

  str += 'source: '.padStart(padWidth) + `${cyan(file)}` + '\n';
  if (!inline) {
    str += 'output dir: '.padStart(padWidth) + `${cyanBright(outputPath)}` + '\n';
  }

  for (let { request, assets } of issuers) {
    request = pathRelativeByPwd(request);
    str += `template: `.padStart(padWidth) + `${magenta(request)}` + '\n';

    assets.forEach((assetFiles, htmlFile) => {
      str += `-> `.padStart(padWidth) + `${green(htmlFile)}` + '\n';
      assetFiles.forEach((jsFile) => {
        str += `- `.padStart(padWidth + 2) + `${yellow(jsFile)}` + '\n';
      });
    });
  }

  outToConsole(str);
};

/**
 * @param {Map<string, string>} issuers
 * @param {string} sourceFile
 */
const verboseResolveResource = ({ issuers, sourceFile }) => {
  const title = 'Resolve Resource';
  let issuersStr = '';

  for (let [issuer, asset] of issuers) {
    let value = asset && asset.startsWith('data:') ? asset.slice(0, asset.indexOf(',')) + ',...' : asset;
    issuersStr +=
      'in: '.padStart(padWidth) + `${magenta(issuer)}\n` + 'as: '.padStart(padWidth) + `${grayBright(value)}\n`;
  }

  outToConsole(
    `${header}${black.bgWhite` ${title} `}\n` + 'source: '.padStart(padWidth) + `${cyan(sourceFile)}\n` + issuersStr
  );
};

/**
 * @param {string} sourceFile
 * @param {Object} data
 */
const verboseExtractInlineResource = ({ sourceFile, data }) => {
  const title = 'Resolve Inline Resource';
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
    `${header}${black.bgWhite` ${title} `}\n` +
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
  verboseExtractScript,
  verboseExtractResource,
  verboseExtractInlineResource,
};
