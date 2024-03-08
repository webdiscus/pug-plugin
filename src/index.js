const path = require('path');
const Config = require('html-bundler-webpack-plugin/Config');

// Note: init config before import the html-bundler-webpack-plugin module
Config.init(path.join(__dirname, './config.js'));

const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

/**
 * @typedef {PluginOptions} HtmlBundlerPluginOptions
 */

class PugPlugin extends HtmlBundlerPlugin {
  /**
   * @param {HtmlBundlerPluginOptions|{}} options
   */
  constructor(options = {}) {
    const PluginOptions = {
      test: /\.(pug|jade)$/, // default extensions for the pug plugin
      enabled: true,
      verbose: false,
      pretty: false, // new option for the pug plugin
      minify: false,
      minifyOptions: null,
      sourcePath: null,
      outputPath: null,
      filename: '[name].html',
      preprocessor: 'pug', // preprocessor for the pug plugin
      postprocess: null,
      js: {},
      css: {},
      extractComments: false,
    };

    super({
      ...PluginOptions,
      ...options,
    });
  }

  /**
   * Called when a compiler object is initialized.
   * Override abstract method.
   *
   * @param {Compiler} compiler The instance of the webpack compilation.
   */
  init(compiler) {
    // TODO: do some thing in an extended plugin
  }
}

module.exports = PugPlugin;
module.exports.loader = PugPlugin.loader;
