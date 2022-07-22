const { outToConsole, isFunction } = require('./utils');
const ansis = require('ansis');
const { plugin } = require('./config');

/**
 * @param {AssetEntryOptions} entry
 */
const verboseEntry = (entry) => {
  if (!entry) return;
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
  outToConsole(
    `${ansis.black.bgGreen(`[${plugin}]`) + ansis.black.bgWhite` Extract Resource `} in ` +
      `${ansis.green(issuerFile)}\n` +
      `      source: ${ansis.cyan(sourceFile)}\n` +
      ` output path: ${ansis.cyanBright(outputPath)}\n` +
      `       asset: ${ansis.cyanBright(assetFile)}\n`
  );
};

module.exports = {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
};
