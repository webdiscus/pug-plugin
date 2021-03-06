const ansis = require('ansis');
const { plugin } = require('./config');
const { outToConsole, isFunction } = require('./utils');

/**
 * @param {AssetEntryOptions} entry
 */
const verboseEntry = (entry) => {
  outToConsole(
    `${ansis.black.bgGreen(`[${plugin}]`)} Compile the entry ${ansis.green(entry.name)}\n` +
      ` filename: ${
        isFunction(entry.filenameTemplate)
          ? ansis.greenBright`[Function: filename]`
          : ansis.magenta(entry.filenameTemplate.toString())
      }\n` +
      ` source: ${ansis.cyan(entry.importFile)}\n` +
      ` output: ${ansis.cyanBright(entry.file)}\n`
  );
};

/**
 * @param {string} issuerFile
 * @param {string} sourceFile
 * @param {string} assetFile
 */
const verboseExtractModule = ({ issuerFile, sourceFile, assetFile }) => {
  outToConsole(
    `${ansis.black.bgGreen(`[${plugin}]`) + ansis.black.bgWhite` Extract Module `} in ` +
      `${ansis.green(issuerFile)}\n` +
      ` source: ${ansis.cyan(sourceFile)}\n` +
      ` output: ${ansis.cyanBright(assetFile)}\n`
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
    `${ansis.black.bgGreen(`[${plugin}]`) + ansis.black.bgWhite` Extract Resource `} in ` +
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
