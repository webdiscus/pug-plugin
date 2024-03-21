const path = require('path');
const Config = require('html-bundler-webpack-plugin/Config');

// Note: init config before import the html-bundler-webpack-plugin module
Config.init(path.join(__dirname, './config.js'));

const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const formatHtml = require('js-beautify').html;

/**
 * Resolve undefined|true|false|''|'auto' value depend on current Webpack mode dev/prod.
 *
 * @param {boolean|string|undefined} value The value one of the values: true, false, 'auto'.
 * @param {boolean} autoDevValue Returns the autoValue in dev mode when value is 'auto'.
 * @param {boolean} autoProdValue Returns the autoValue in prod mode when value is 'auto'.
 * @param {boolean|string} defaultValue Returns default value when value is undefined.
 * @param {boolean} isProd Is production mode.
 * @return {boolean}
 */
const toBool = (value, { autoDevValue, autoProdValue, defaultValue, isProd }) => {
  if (value == null) value = defaultValue;
  // note: if a parameter is defined without a value or value is empty, then the value is true
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  if (value === true || value === false) return value;

  if (value === 'auto') {
    if (!isProd && autoDevValue != null) return autoDevValue;
    if (isProd && autoProdValue != null) return autoProdValue;
  }

  return false;
};

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
      pretty: false, // formatting html for the pug plugin
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
    const pretty = PugPlugin.option.options.pretty;
    const userPrettyOptions = PugPlugin.option.options.prettyOptions;

    // formatting options: https://github.com/beautifier/js-beautify
    const defaultPrettyOptions = {
      html: {
        indent_size: 2,
        end_with_newline: true,
        indent_inner_html: true,
        preserve_newlines: true,
        max_preserve_newlines: 0,
        wrap_line_length: 120,
        extra_liners: [],
        space_before_conditional: true,
        js: {
          end_with_newline: false,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          space_after_anon_function: true,
        },
        css: {
          end_with_newline: false,
          preserve_newlines: false,
          newline_between_rules: false,
        },
      },
    };

    let isPretty;
    let prettyOption;

    if (pretty && !['boolean', 'string'].includes(typeof pretty)) {
      isPretty = true;
      prettyOption = pretty;
    } else if (userPrettyOptions != null) {
      isPretty = true;
      prettyOption = { ...defaultPrettyOptions, ...userPrettyOptions };
    } else {
      isPretty = toBool(pretty, {
        defaultValue: false,
        autoDevValue: true,
        isProd: PugPlugin.option.productionMode,
      });
      prettyOption = defaultPrettyOptions;
    }

    if (isPretty) {
      //console.log({ prettyOption });
      PugPlugin.option.addProcess('postprocess', (content) => formatHtml(content, prettyOption));
    }
  }
}

module.exports = PugPlugin;
module.exports.loader = PugPlugin.loader;
