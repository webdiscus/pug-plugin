const fs = require('fs');
const path = require('path');
const ansis = require('ansis');
const { plugin } = require('./config');

const ansisPluginName = `\n${ansis.black.bgRedBright(`[${plugin}]`)}`;
let lastError = null;

class PugPluginException extends Error {
  constructor(message) {
    super(message);
    this.name = 'PugPluginException';
    this.message = message;
  }
}

/**
 * @param {string} message The error description.
 * @param {PugPluginException|Error|string?} error The original error from catch()
 * @constructor
 */
const PugPluginError = function (message, error = '') {
  if (error && error instanceof PugPluginException) {
    if (error.toString() === lastError) {
      // prevent double output same error
      throw new PugPluginException(lastError);
    }
    // throw original error to avoid output all nested exceptions
    lastError = error.toString();
    throw new Error(lastError);
  }
  lastError = message + `\n` + error;
  throw new PugPluginException(lastError);
};

/**
 * @param {ModuleOptions[]} modules
 * @throws {Error}
 */
const optionModulesException = (modules) => {
  const message =
    `${ansisPluginName} The plugin option ${ansis.green('modules')} must be the array of ${ansis.green(
      'ModuleOptions'
    )} but given:\n` + ansis.cyanBright(JSON.stringify(modules));

  PugPluginError(message);
};

/**
 * @throws {Error}
 */
const publicPathException = () => {
  const message =
    `${ansisPluginName} This plugin yet not support 'auto' or undefined ${ansis.yellow('output.publicPath')}.\n` +
    `Define a publicPath in the webpack configuration, for example: \n` +
    `${ansis.magenta("output: { publicPath: '/' }")}\n` +
    `  or as a function (will be called in compilation time)\n` +
    `${ansis.magenta("output: { publicPath: (obj) => '/' }")}.`;

  PugPluginError(message);
};

/**
 * @param {string} file
 * @param {string} issuer
 * @throws {Error}
 */
const resolveException = (file, issuer) => {
  let message = `${ansisPluginName} Can't resolve the file ${ansis.cyan(file)} in ${ansis.blueBright(issuer)}`;

  if (path.isAbsolute(file) && !fs.existsSync(file)) {
    message += `\n${ansis.yellow('The reason:')} this file not found!`;
  } else if (/\.css$/.test(file) && file.indexOf('??ruleSet')) {
    message += `\nThe ${ansis.yellow('@import CSS rule')} is not supported. Avoid CSS imports!`;
  }

  PugPluginError(message);
};

/**
 * @param {Error} error
 * @param {string} sourceFile
 * @param {string} source
 * @throws {Error}
 */
const executeTemplateFunctionException = (error, sourceFile, source) => {
  const message =
    `${ansisPluginName} Failed to execute template function'.\n` + `The source file: '${ansis.cyan(sourceFile)}'.`;

  PugPluginError(message, error);
};

/**
 * @param {Error} error
 * @param {ResourceInfo} info
 * @throws {Error}
 */
const postprocessException = (error, info) => {
  const message =
    `${ansisPluginName} Postprocess execution failed by the output file '${info.outputFile}'.\n` +
    `The source file '${info.sourceFile}'.`;

  PugPluginError(message, error);
};

module.exports = {
  PugPluginError,
  PugPluginException,
  optionModulesException,
  resolveException,
  publicPathException,
  executeTemplateFunctionException,
  postprocessException,
};
