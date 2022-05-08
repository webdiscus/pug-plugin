const beautify = require('js-beautify').html;

/**
 * Pretty format HTML.
 * @singleton
 */
const Pretty = {
  // intentionally hard coded options
  // user can the `pretty` option enable/disable only, without customizing
  options: {
    html: {
      indent_size: 2,
      end_with_newline: true,
      indent_inner_html: true,
      preserve_newlines: true,
      max_preserve_newlines: 0,
      wrap_line_length: 120,
      extra_liners: [],
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
  },

  format(content) {
    return beautify(content, this.options);
  },
};

module.exports = Pretty;
