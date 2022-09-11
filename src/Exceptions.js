const fs = require('fs');
const path = require('path');
const { red, green, cyan, cyanBright, yellow, magenta, white, black, blueBright } = require('ansis/colors');
const { pluginName } = require('./config');
const { outToConsole, parseRequest } = require('./Utils');

const ansiPluginName = `\n${red`[${pluginName}]`}`;
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
    `${ansiPluginName} The plugin option ${green`modules`} must be the array of ${green`ModuleOptions`} but given:\n` +
    cyanBright(JSON.stringify(modules));

  PugPluginError(message);
};

/**
 * @param {string} file
 * @param {string} issuer
 * @throws {Error}
 */
const resolveException = (file, issuer) => {
  let message = `${ansiPluginName} Can't resolve the file ${cyan(file)} in ${blueBright(issuer)}`;

  if (path.isAbsolute(file) && !fs.existsSync(file)) {
    message += `\n${yellow`The reason:`} this file not found!`;
  } else if (/\.css$/.test(file) && file.indexOf('??ruleSet')) {
    message +=
      `\nThe handling of ${yellow`@import at-rules in CSS`} is not supported. Disable the 'import' option in 'css-loader':\n` +
      white`
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
  const message = `${ansiPluginName} Failed to execute the template function'.\nSource file: '${cyan(sourceFile)}'`;

  PugPluginError(message, error);
};

/**
 * @param {Error} error
 * @param {ResourceInfo} info
 * @throws {Error}
 */
const postprocessException = (error, info) => {
  const message = `${ansiPluginName} Postprocess is failed'.\n` + `Source file: '${cyan(info.sourceFile)}'.`;

  PugPluginError(message, error);
};

const duplicateScriptWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    `${black.bgYellow`[${pluginName}] WARNING `} ` +
      `${yellow`Duplicate scripts are not allowed in same Pug file!`}\n` +
      `The file ${cyan(resource)} is already used in ${magenta(issuer)}.\n` +
      `Note: only first script will be resolved, all duplicates will be ignored.\n`
  );
};

const duplicateStyleWarning = (request, issuer) => {
  const { resource } = parseRequest(request);
  outToConsole(
    `${black.bgYellow`[${pluginName}] WARNING `} ` +
      `${yellow`Duplicate styles are not allowed in same Pug file!`}\n` +
      `The file ${cyan(resource)} is already used in ${magenta(issuer)}.\n`
  );
};

module.exports = {
  PugPluginError,
  PugPluginException,
  optionModulesException,
  resolveException,
  executeTemplateFunctionException,
  postprocessException,
  duplicateScriptWarning,
  duplicateStyleWarning,
};
