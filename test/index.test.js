import { compareFileListAndContent, exceptionContain, stdoutContain } from './utils/helpers';
import { PluginError, PluginException } from '../src/Messages/Exception';
import { parseQuery } from '../src/Utils';
import AssetEntry from '../src/AssetEntry';

import { PATHS } from './config';

describe('unit tests', () => {
  test('parseQuery array', (done) => {
    const received = parseQuery('file.pug?key=val&arr[]=a&arr[]=1');
    const expected = {
      key: 'val',
      arr: ['a', '1'],
    };
    expect(received).toEqual(expected);
    done();
  });

  test('parseQuery json5', (done) => {
    const received = parseQuery('file.pug?{sizes:[10,20,30], format: "webp"}');
    const expected = {
      format: 'webp',
      sizes: [10, 20, 30],
    };
    expect(received).toEqual(expected);
    done();
  });
});

describe('AssetEntry tests', () => {
  test('inEntry', (done) => {
    const received = AssetEntry.inEntry('file.js');
    expect(received).toBeFalsy();
    done();
  });

  test('reset', (done) => {
    AssetEntry.compilationEntryNames = new Set(['home', 'about']);
    AssetEntry.reset();
    const received = AssetEntry.compilationEntryNames;
    expect(received).toEqual(new Set());
    done();
  });
});

describe('options', () => {
  test('default webpack config', (done) => {
    compareFileListAndContent(PATHS, 'webpack-config-default', done);
  });

  test('output.publicPath = auto', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-auto', done);
  });

  test('output.publicPath = function', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-function', done);
  });

  test('output.publicPath = ""', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-empty', done);
  });

  test('output.publicPath = "/"', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-root', done);
  });

  test('publicPath = "http://localhost:8080"', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-url', done);
  });

  test('output.filename', (done) => {
    compareFileListAndContent(PATHS, 'option-output-filename', done);
  });

  test('options.enabled = false', (done) => {
    compareFileListAndContent(PATHS, 'option-enabled', done);
  });

  test('options.test (extensions)', (done) => {
    compareFileListAndContent(PATHS, 'option-extension-test', done);
  });

  test('options.filename as template', (done) => {
    compareFileListAndContent(PATHS, 'option-filename-template', done);
  });

  test('options.filename as function', (done) => {
    compareFileListAndContent(PATHS, 'option-filename-function', done);
  });

  test('options.filename as function for separate assets', (done) => {
    compareFileListAndContent(PATHS, 'option-filename-separate-assets', done);
  });

  test('options.sourcePath and options.outputPath (default)', (done) => {
    compareFileListAndContent(PATHS, 'option-default-path', done);
  });

  test('options.sourcePath and options.outputPath', (done) => {
    compareFileListAndContent(PATHS, 'option-custom-path', done);
  });

  test('options.modules (extractCss)', (done) => {
    compareFileListAndContent(PATHS, 'option-modules-css', done);
  });

  test('option module pug outputPath', (done) => {
    compareFileListAndContent(PATHS, 'option-pug-outputPath', done);
  });

  test('option js.filename', (done) => {
    compareFileListAndContent(PATHS, 'option-js-filename', done);
  });

  test('options js, css outputPath absolute', (done) => {
    compareFileListAndContent(PATHS, 'option-js-css-outputPath-absolute', done);
  });

  test('options js, css outputPath relative', (done) => {
    compareFileListAndContent(PATHS, 'option-js-css-outputPath-relative', done);
  });

  test('options.pretty', (done) => {
    compareFileListAndContent(PATHS, 'option-pretty', done);
  });

  test('options.verbose', (done) => {
    compareFileListAndContent(PATHS, 'option-verbose', done);
  });

  test('options.modules.postprocess', (done) => {
    compareFileListAndContent(PATHS, 'option-modules-postprocess', done);
  });

  test('options.postprocess', (done) => {
    compareFileListAndContent(PATHS, 'option-postprocess', done);
  });

  test('options.extractComments = false', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-false', done);
  });

  test('options.extractComments = true', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-true', done);
  });
});

describe('source map', () => {
  test('css with source-map', (done) => {
    compareFileListAndContent(PATHS, 'devtool-source-map', done);
  });

  test('css with inline-source-map', (done) => {
    compareFileListAndContent(PATHS, 'devtool-inline-source-map', done);
  });

  test('css without source-map', (done) => {
    compareFileListAndContent(PATHS, 'devtool-no-source-map', done);
  });
});

describe('integration tests', () => {
  test('Hello World!', (done) => {
    compareFileListAndContent(PATHS, 'hello-world', done);
  });

  test('entry: html, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-html-pug', done);
  });

  test('entry: load styles from entry with same base names using generator', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-with-same-names', done);
  });

  test('entry: js, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-js-pug', done);
  });

  test('entry styles bypass to other plugin', (done) => {
    compareFileListAndContent(PATHS, 'entry-styles-bypass', done);
  });

  test('entry: pass data via query', (done) => {
    compareFileListAndContent(PATHS, 'entry-pug-query', done);
  });

  test('entry: pug require data, method compile', (done) => {
    compareFileListAndContent(PATHS, 'require-data-compile', done);
  });

  test('entry: pug require data, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-data-render', done);
  });

  test('entry: pug require data, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-data-html', done);
  });

  test('entry: alias resolve.plugins, method compile', (done) => {
    compareFileListAndContent(PATHS, 'entry-alias-resolve-compile', done);
  });

  test('entry: keep all output folder structure for pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-pug-keep-all-output-dir', done);
  });

  test('entry: keep single output folder structure for pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-pug-keep-single-output-dir', done);
  });

  test('pug-loader config: pug in entry and require pug in js with query `pug-compile`', (done) => {
    compareFileListAndContent(PATHS, 'pug-in-entry-and-js-query', done);
  });

  test('pug-loader config: pug in entry and require pug in js with multiple config', (done) => {
    compareFileListAndContent(PATHS, 'pug-in-entry-and-js-config', done);
  });
});

describe('extract css', () => {
  test('entry: css font-face src', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-font-face-src', done);
  });

  test('entry: sass resolve url', (done) => {
    // tested for: compile, render
    compareFileListAndContent(PATHS, 'entry-sass-resolve-url', done);
  });

  test('entry: pug require style used url', (done) => {
    compareFileListAndContent(PATHS, 'entry-pug-sass-import-url', done);
  });

  test('entry: sass, pug (production)', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-pug-prod', done);
  });

  test('entry: sass, pug (development)', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-pug-devel', done);
  });

  test('@import url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-css', done);
  });

  test('@import url() in SCSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-scss', done);
  });
});

describe('require images', () => {
  test('require images in pug, method compile', (done) => {
    compareFileListAndContent(PATHS, 'require-images-compile', done);
  });

  test('require images in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-images-render', done);
  });

  test('require images in pug, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-images-html', done);
  });

  test('require image variable in pug, method compile', (done) => {
    compareFileListAndContent(PATHS, 'require-images-variable-compile', done);
  });

  test('require image variable in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-images-variable-render', done);
  });

  test('require image variable in pug, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-images-variable-html', done);
  });

  test('svg with fragment', (done) => {
    compareFileListAndContent(PATHS, 'require-img-svg-fragment', done);
  });

  test('svg href with fragment, filename', (done) => {
    compareFileListAndContent(PATHS, 'require-img-svg-fragment-filename', done);
  });
});

describe('require assets', () => {
  test('require fonts in pug', (done) => {
    compareFileListAndContent(PATHS, 'require-fonts', done);
  });

  test('require assets in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-render', done);
  });

  test('require assets in pug, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-html', done);
  });

  test('resolve styles in pug', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles', done);
  });

  test('resolve styles in pug from node_modules', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-from-module', done);
  });

  test('resolve styles in pug from node_modules with .ext in module name', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-from-module.ext', done);
  });

  test('resolve styles with same name', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-with-same-name', done);
  });

  test('resolve styles with same name, hash', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-with-same-name-hash', done);
  });

  test('require styles in pug and use compiled styles from webpack entry', (done) => {
    compareFileListAndContent(PATHS, 'require-and-entry-styles', done);
  });

  test('require same asset with different raw request', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-same-pug-scss', done);
  });

  test('multiple-chunks-same-filename', (done) => {
    compareFileListAndContent(PATHS, 'multiple-chunks-same-filename', done);
  });

  test('resolve the url(image) in CSS, method render', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-in-css-render', done);
  });

  // TODO: fix the issue
  // test('resolve the url(image) in CSS, method html', (done) => {
  //   compareFileListAndContent(PATHS, 'resolve-url-in-css-html', done);
  // });
});

describe('inline style & script', () => {
  test('inline script using URL query `?inline`', (done) => {
    compareFileListAndContent(PATHS, 'inline-script-query', done);
  });

  test('inline style using URL query `?inline` and resolve url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-query', done);
  });

  test('inline style with source map using URL query `?inline`', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-query-with-source-map', done);
  });

  test('inline style using asset/source', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-asset-source', done);
  });

  test('inline style using asset/source with source-map', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-asset-source-with-source-map', done);
  });

  test('inline style using asset/source and style as file', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-asset-source-as-inline-and-file', done);
  });
});

describe('resolve paths in root context', () => {
  test('require same image in pug and scss', (done) => {
    compareFileListAndContent(PATHS, 'resolve-context-image-pug-scss', done);
  });

  test('resolve script with auto publicPath', (done) => {
    compareFileListAndContent(PATHS, 'resolve-context-script', done);
  });

  test('resolve script with and w/o extension', (done) => {
    compareFileListAndContent(PATHS, 'resolve-context-script-ext', done);
  });
});

describe('resolve assets in pug with url query', () => {
  test('resolve-assets-multi-lang-page', (done) => {
    compareFileListAndContent(PATHS, 'resolve-assets-multi-lang-page', done);
  });

  test('resolve-css-in-diff-output-html', (done) => {
    compareFileListAndContent(PATHS, 'resolve-css-in-diff-output-html', done);
  });

  test('resolve-js-in-diff-output-html', (done) => {
    compareFileListAndContent(PATHS, 'resolve-js-in-diff-output-html', done);
  });

  // TODO: optimize code to pass the test
  // test('resolve-js-pug-same-name', (done) => {
  //   compareFileListAndContent(PATHS, 'resolve-js-pug-same-name', done);
  // });
});

describe('split chunks', () => {
  test('extract css and js w/o runtime code of css-loader', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-css-js', done);
  });

  test('import source scripts and styles from many node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-many-vendors', done);
  });

  test('import source scripts and styles from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-source', done);
  });

  test('resolve assets when used split chunk, development', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-dev', done);
  });

  test('resolve assets when used split chunk, production', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-prod', done);
  });

  test('load vendor scripts from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-vendor', done);
  });
});

describe('resolve url in style', () => {
  test('alias in url', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-alias', done);
  });

  test('alias and relative in url', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-alias-relative', done);
  });

  test('relative path in url', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-relative', done);
  });

  test('relative public path', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-relative-public-path', done);
  });

  test('resolve-url-deep', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-deep', done);
  });
});

describe('inline assets', () => {
  test('inline-asset-bypass-data-url', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-bypass-data-url', done);
  });

  test('query ?inline, method render', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-query', done);
  });

  test('svgo loader', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-query-svgo', done);
  });

  test('data-URL and inline-SVG in pug and css, method render', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-pug-css', done);
  });

  test('decide by size data-URL/inline-SVG or file, method render', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-decide-size', done);
  });

  test('data-URL and inline-SVG exclude fonts, method render', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-exclude-svg-fonts', done);
  });
});

describe('require in script tag', () => {
  test('method compile', (done) => {
    compareFileListAndContent(PATHS, 'require-scripts-compile', done);
  });

  test('method render', (done) => {
    compareFileListAndContent(PATHS, 'require-scripts-render', done);
  });

  test('method html', (done) => {
    compareFileListAndContent(PATHS, 'require-scripts-html', done);
  });

  test('require scripts with same name', (done) => {
    compareFileListAndContent(PATHS, 'require-scripts-same-src', done);
  });
});

describe('extras: responsive images', () => {
  test('responsive images in template', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images', done);
  });

  test('require images in pug and in style', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-pug-scss', done);
  });

  test('require many duplicate images in pug and styles', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-many-duplicates', done);
  });
});

describe('special cases', () => {
  // TODO: fix it. Note: in html bundler plugin it is already fixed.
  // test('resolve manifest.json', (done) => {
  //   compareFileListAndContent(PATHS, 'resolve-manifest.json', done);
  // });

  test('require-esm-script', (done) => {
    compareFileListAndContent(PATHS, 'require-esm-script', done);
  });

  test('js-import-image', (done) => {
    compareFileListAndContent(PATHS, 'js-import-image', done);
  });

  test('compile template function in js', (done) => {
    compareFileListAndContent(PATHS, 'js-tmpl-entry-js', done);
  });
});

// Test Messages

describe('warning tests', () => {
  test('duplicate scripts', (done) => {
    const containString = 'Duplicate scripts are not allowed';
    stdoutContain(PATHS, 'msg-warning-duplicate-scripts', containString, done);
  });

  test('duplicate scripts using alias', (done) => {
    const containString = 'Duplicate scripts are not allowed';
    stdoutContain(PATHS, 'msg-warning-duplicate-scripts-alias', containString, done);
  });

  test('duplicate styles', (done) => {
    const containString = 'Duplicate styles are not allowed';
    stdoutContain(PATHS, 'msg-warning-duplicate-styles', containString, done);
  });
});

describe('exception tests', () => {
  test('exception test: previous error', (done) => {
    const containString = 'previous error';

    try {
      PluginError('previous error');
    } catch (error) {
      try {
        PluginError('last error', error);
      } catch (error) {
        expect(error.toString()).toContain(containString);
        done();
      }
    }
  });

  test('exception test: nested exceptions', (done) => {
    const containString = 'last error';

    const originalError = new PluginException('original error');
    try {
      PluginError('previous error', originalError);
    } catch (error) {
      try {
        PluginError('last error', error);
      } catch (error) {
        expect(error.toString()).toContain(containString);
        done();
      }
    }
  });

  test('exception: execute template function', (done) => {
    const containString = 'Failed to execute the template function';
    exceptionContain(PATHS, 'msg-exception-execute-template', containString, done);
  });

  test('exception: resolve required file', (done) => {
    const containString = `Can't resolve the file`;
    exceptionContain(PATHS, 'msg-exception-resolve-file', containString, done);
  });

  test('exception: @import CSS is not supported', (done) => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    exceptionContain(PATHS, 'msg-exception-import-css-rule', containString, done);
  });

  test('exception: option modules', (done) => {
    const containString = 'must be the array of';
    exceptionContain(PATHS, 'msg-exception-option-modules', containString, done);
  });

  test('exception: execute postprocess', (done) => {
    const containString = 'Postprocess is failed';
    exceptionContain(PATHS, 'msg-exception-execute-postprocess', containString, done);
  });

  test('exception: multiple chunks with same filename', (done) => {
    const containString = 'Multiple chunks emit assets to the same filename';
    exceptionContain(PATHS, 'msg-exception-multiple-chunks-same-filename', containString, done);
  });
});

describe('DEPRECATE tests', () => {
  test('deprecate-option-extractCss', (done) => {
    const containString = `Use the 'css' option name instead of 'extractCss'`;
    stdoutContain(PATHS, 'msg-deprecate-option-extractCss', containString, done);
  });
});
