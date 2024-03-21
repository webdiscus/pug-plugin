const path = require('path');
const PugPlugin = require('@test/pug-plugin');

const pretty = require('js-beautify').html;

// formatting options: https://github.com/beautifier/js-beautify
const prettyOptions = {
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

const isDev = true;

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new PugPlugin({
      entry: {
        index: './src/index.pug',
      },
      beforeEmit: isDev ? (content) => pretty(content, prettyOptions) : undefined,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
