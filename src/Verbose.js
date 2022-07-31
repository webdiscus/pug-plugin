const ansis = require('ansis');
const { pluginName } = require('./config');
const { outToConsole, isFunction } = require('./Utils');

/**
 * @param {string} name
 * @param {string} importFile
 * @param {string} outputPath
 * @param {string} filename
 * @param {string | Function} filenameTemplate
 */
const verboseEntry = ({ name, importFile, outputPath, filename, filenameTemplate }) => {
  outToConsole(
    `${ansis.black.bgGreen(`[${pluginName}]`)} Compile the entry ${ansis.green(name)}\n` +
      `    filename: ${
        isFunction(filenameTemplate)
          ? ansis.greenBright`[Function: filename]`
          : ansis.magenta(filenameTemplate.toString())
      }\n` +
      `      source: ${ansis.cyan(importFile)}\n` +
      ` output path: ${ansis.cyanBright(outputPath)}\n` +
      `       asset: ${ansis.cyanBright(filename)}\n`
  );
};

/**
 * @param {string} issuerFile
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 */
const verboseExtractModule = ({ issuerFile, sourceFile, outputPath, assetFile }) => {
  outToConsole(
    `${ansis.black.bgGreen(`[${pluginName}]`) + ansis.black.bgWhite` Extract Module `} in ` +
      `${ansis.green(issuerFile)}\n` +
      `      source: ${ansis.cyan(sourceFile)}\n` +
      ` output path: ${ansis.cyanBright(outputPath)}\n` +
      `       asset: ${ansis.cyanBright(assetFile)}\n`
  );
};

/**
 * @param {string} issuerFile
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 */
const verboseExtractResource = ({ issuerFile, sourceFile, outputPath, assetFile }) => {
  let isInline = false;
  if (assetFile.startsWith('data:')) {
    isInline = true;
    assetFile = assetFile.slice(0, assetFile.indexOf(',')) + ',...';
  }
  outToConsole(
    `${ansis.black.bgGreen(`[${pluginName}]`) + ansis.black.bgWhite` Extract Resource `} in ` +
      `${ansis.green(issuerFile)}\n` +
      `      source: ${ansis.cyan(sourceFile)}\n` +
      (isInline ? '' : ` output path: ${ansis.cyanBright(outputPath)}\n`) +
      `${isInline ? 'inline ' : '       '}asset: ${ansis.cyanBright(assetFile)}\n`
  );
};

module.exports = {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
};
