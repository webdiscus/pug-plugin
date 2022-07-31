const fs = require('fs');
const path = require('path');
const ansis = require('ansis');
const { pluginName } = require('./config');
const { outToConsole, parseRequest } = require('./Utils');

const ansisPluginName = `\n${ansis.red(`[${pluginName}]`)}`;
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
    `${ansisPluginName} The plugin option ${ansis.green`modules`} must be the array of ${ansis.green`ModuleOptions`} but given:\n` +
    ansis.cyanBright(JSON.stringify(modules));

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
    message += `\n${ansis.yellow`The reason:`} this file not found!`;
  } else if (/\.css$/.test(file) && file.indexOf('??ruleSet')) {
    //message += `\nThe ${ansis.yellow('@import CSS rule')} is not supported. Avoid CSS imports!`;
    message +=
      `\nThe handling of ${ansis.yellow`@import at-rules in CSS`} is not supported. Disable the 'import' option in 'css-loader':\n` +
      ansis.white`
{
  test: /\.(css|scss)$/i,
  use: [
    {
      loader: 'css-loader',
      options: {
        import: false, // disable @import at-rules handling
      },
    },
    'sass-loader',
  ],
},`;
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
    `${ansisPluginName} Failed to execute the template function'.\n` + `The source file: '${ansis.cyan(sourceFile)}'.`;

  PugPluginError(message, error);
};

/**
 * @param {Error} error
 * @param {ResourceInfo} info
 * @throws {Error}
 */
const postprocessException = (error, info) => {
  const message = `${ansisPluginName} Postprocess is failed'.\n` + `The source file: '${ansis.cyan(info.sourceFile)}'.`;

  PugPluginError(message, error);
};

/**
 * @param {string} file The source file of asset.
 */
const webpackEntryWarning = (file) => {
  const hlAttr = ansis.hex('#c59df0');
  const hlFn = ansis.hex('#79c0ff');
  const hlVal = ansis.hex('#a5d6ff');
  const hlTag = ansis.hex('#7de686');

  outToConsole(
    `${ansis.black.bgYellow(`[${pluginName}] WARNING `)} ` +
      `${ansis.yellow`Scripts and styles are not allowed in Webpack entry, they must be specified directly in Pug!`}\n` +
      `The file ${ansis.cyan(file)} must be specified in Pug.\n` +
      `For example:\n` +
      `  ${hlTag`link`}(${hlAttr`href`}=${hlFn`require`}(${hlVal`'./styles.scss'`}) ${hlAttr`rel`}=${hlVal`'stylesheet'`})\n` +
      `  ${hlTag`script`}(${hlAttr`src`}=${hlFn`require`}(${hlVal`'./scripts.js'`}) ${hlAttr`defer`})\n` +
      `For more information, see ${ansis.blueBright`https://github.com/webdiscus/pug-plugin`}.`
  );
};

const duplicateScriptWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    `${ansis.black.bgYellow(`[${pluginName}] WARNING `)} ` +
      `${ansis.yellow`Duplicate scripts are not allowed in same Pug file!`}\n` +
      `The file ${ansis.cyan(resource)} is already used in ${ansis.magenta(issuer)}.\n` +
      `Note: only first script will be resolved, all duplicates will be ignored.\n`
  );
};

const duplicateStyleWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    `${ansis.black.bgYellow(`[${pluginName}] WARNING `)} ` +
      `${ansis.yellow`Duplicate styles are not allowed in same Pug file!`}\n` +
      `The file ${ansis.cyan(resource)} is already used in ${ansis.magenta(issuer)}.\n`
  );
};

module.exports = {
  PugPluginError,
  PugPluginException,
  optionModulesException,
  resolveException,
  executeTemplateFunctionException,
  postprocessException,
  webpackEntryWarning,
  duplicateScriptWarning,
  duplicateStyleWarning,
};
