import { compareFiles, exceptionContain, stdoutContain } from './utils/helpers';
import { PluginError, PluginException } from '../src/Messages/Exception';

import { parseQuery } from '../src/Utils';
import AssetEntry from '../src/AssetEntry';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

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
  test('default webpack config', () => compareFiles('webpack-config-default'));
  test('output.publicPath = auto', () => compareFiles('option-output-public-path-auto'));
  test('output.publicPath = function', () => compareFiles('option-output-public-path-function'));
  test('output.publicPath = ""', () => compareFiles('option-output-public-path-empty'));
  test('publicPath = "http://localhost:8080"', () => compareFiles('option-output-public-path-root'));
  test('output.publicPath = "/"', () => compareFiles('option-output-public-path-url'));
  test('output.filename', () => compareFiles('option-output-filename'));
  test('options.enabled = false', () => compareFiles('option-enabled'));
  test('options.test (extensions)', () => compareFiles('option-extension-test'));
  test('options.filename as template', () => compareFiles('option-filename-template'));
  test('options.filename as function', () => compareFiles('option-filename-function'));
  test('options.filename as function for separate assets', () => compareFiles('option-filename-separate-assets'));
  test('options.sourcePath and options.outputPath (default)', () => compareFiles('option-default-path'));
  test('options.sourcePath and options.outputPath', () => compareFiles('option-custom-path'));
  test('options.modules (extractCss)', () => compareFiles('option-modules-css'));
  test('option module pug outputPath', () => compareFiles('option-pug-outputPath'));
  test('option js.filename', () => compareFiles('option-js-filename'));
  test('options js, css outputPath absolute', () => compareFiles('option-js-css-outputPath-absolute'));
  test('options js, css outputPath relative', () => compareFiles('option-js-css-outputPath-relative'));
  test('options.pretty', () => compareFiles('option-pretty'));
  test('options.verbose', () => compareFiles('option-verbose'));
  test('options.modules.postprocess', () => compareFiles('option-modules-postprocess'));
  test('options.postprocess', () => compareFiles('option-postprocess'));
  test('options.extractComments = false', () => compareFiles('option-extract-comments-false'));
  test('options.extractComments = true', () => compareFiles('option-extract-comments-true'));
});

describe('source map', () => {
  test('css with source-map', () => compareFiles('devtool-source-map'));
  test('css with inline-source-map', () => compareFiles('devtool-inline-source-map'));
  test('css without source-map', () => compareFiles('devtool-no-source-map'));
});

describe('integration tests', () => {
  test('Hello World!', () => compareFiles('hello-world'));
  test('entry: html, pug', () => compareFiles('entry-html-pug'));
  test('entry: load styles from entry with same base names using generator', () => compareFiles('entry-sass-with-same-names'));
  test('entry: js, pug', () => compareFiles('entry-js-pug'));
  test('entry styles bypass to other plugin', () => compareFiles('entry-styles-bypass'));
  test('entry: pass data via query', () => compareFiles('entry-pug-query'));
  test('entry: pug require data, method compile', () => compareFiles('require-data-compile'));
  test('entry: pug require data, method render', () => compareFiles('require-data-render'));
  test('entry: pug require data, method html', () => compareFiles('require-data-html'));
  test('entry: alias resolve.plugins, method compile', () => compareFiles('entry-alias-resolve-compile'));
  test('entry: keep all output folder structure for pug', () => compareFiles('entry-pug-keep-all-output-dir'));
  test('entry: keep single output folder structure for pug', () => compareFiles('entry-pug-keep-single-output-dir'));
  test('pug-loader config: pug in entry and require pug in js with query `pug-compile`', () => compareFiles('pug-in-entry-and-js-query'));
  test('pug-loader config: pug in entry and require pug in js with multiple config', () => compareFiles('pug-in-entry-and-js-config'));
});

describe('extract css', () => {
  test('entry: css font-face src', () => compareFiles('entry-sass-font-face-src'));
  test('entry: sass resolve url', () => compareFiles('entry-sass-resolve-url')); // tested for: compile, render
  test('entry: pug require style used url', () => compareFiles('entry-pug-sass-import-url'));
  test('entry: sass, pug (production)', () => compareFiles('entry-sass-pug-prod'));
  test('entry: sass, pug (development)', () => compareFiles('entry-sass-pug-devel'));
  test('@import url() in CSS', () => compareFiles('import-url-in-css'));
  test('@import url() in SCSS', () => compareFiles('import-url-in-scss'));
});

//
describe('require images', () => {
  test('require images in pug, method compile', () => compareFiles('require-images-compile'));
  test('require images in pug, method render', () => compareFiles('require-images-render'));
  test('require images in pug, method html', () => compareFiles('require-images-html'));
  test('require image variable in pug, method compile', () => compareFiles('require-images-variable-compile'));
  test('require image variable in pug, method render', () => compareFiles('require-images-variable-render'));
  test('require image variable in pug, method html', () => compareFiles('require-images-variable-html'));
  test('svg with fragment', () => compareFiles('require-img-svg-fragment'));
  test('svg href with fragment, filename', () => compareFiles('require-img-svg-fragment-filename'));
});

describe('require assets', () => {
  test('require fonts in pug', () => compareFiles('require-fonts'));
  test('require assets in pug, method render', () => compareFiles('require-assets-render'));
  test('require assets in pug, method html', () => compareFiles('require-assets-html'));
  test('resolve styles in pug', () => compareFiles('resolve-styles'));
  test('resolve styles in pug from node_modules', () => compareFiles('resolve-styles-from-module'));
  test('resolve styles in pug from node_modules with .ext in module name', () => compareFiles('resolve-styles-from-module.ext'));
  test('resolve styles with same name', () => compareFiles('resolve-styles-with-same-name'));
  test('resolve styles with same name, hash', () => compareFiles('resolve-styles-with-same-name-hash'));
  test('require styles in pug and use compiled styles from webpack entry', () => compareFiles('require-and-entry-styles'));
  test('require same asset with different raw request', () => compareFiles('require-assets-same-pug-scss'));
  test('multiple-chunks-same-filename', () => compareFiles('multiple-chunks-same-filename'));
  test('resolve the url(image) in CSS, method render', () => compareFiles('resolve-url-in-css-render'));
  // TODO: fix the issue
  //test('resolve the url(image) in CSS, method html', () => compareFiles('resolve-url-in-css-html'));
});

describe('inline style & script', () => {
  test('inline script using URL query `?inline`', () => compareFiles('inline-script-query'));
  test('inline style using URL query `?inline` and resolve url() in CSS', () => compareFiles('inline-style-query'));
  test('inline style with source map using URL query `?inline`', () => compareFiles('inline-style-query-with-source-map'));
  test('inline style using asset/source', () => compareFiles('inline-style-asset-source'));
  test('inline style using asset/source with source-map', () => compareFiles('inline-style-asset-source-with-source-map'));
  test('inline style using asset/source and style as file', () => compareFiles('inline-style-asset-source-as-inline-and-file'));
});

describe('resolve paths in root context', () => {
  test('require same image in pug and scss', () => compareFiles('resolve-context-image-pug-scss'));
  test('resolve script with auto publicPath', () => compareFiles('resolve-context-script'));
  test('resolve script with and w/o extension', () => compareFiles('resolve-context-script-ext'));
});

describe('resolve assets in pug with url query', () => {
  test('resolve-assets-multi-lang-page', () => compareFiles('resolve-assets-multi-lang-page'));
  test('resolve-css-in-diff-output-html', () => compareFiles('resolve-css-in-diff-output-html'));
  test('resolve-js-in-diff-output-html', () => compareFiles('resolve-js-in-diff-output-html'));
  // TODO: optimize code to pass the test
  //test('resolve-js-pug-same-name', () => compareFiles('resolve-js-pug-same-name'));
});

describe('split chunks', () => {
  test('extract css and js w/o runtime code of css-loader', () => compareFiles('split-chunk-css-js'));
  test('import source scripts and styles from many node module', () => compareFiles('split-chunk-node-module-many-vendors'));
  test('import source scripts and styles from node module', () => compareFiles('split-chunk-node-module-source'));
  test('resolve assets when used split chunk, development', () => compareFiles('split-chunk-resolve-assets-dev'));
  test('resolve assets when used split chunk, production', () => compareFiles('split-chunk-resolve-assets-prod'));
  test('load vendor scripts from node module', () => compareFiles('split-chunk-vendor'));
});

describe('resolve url in style', () => {
  test('alias in url', () => compareFiles('resolve-url-alias'));
  test('alias and relative in url', () => compareFiles('resolve-url-alias-relative'));
  test('relative path in url', () => compareFiles('resolve-url-relative'));
  test('relative public path', () => compareFiles('resolve-url-relative-public-path'));
  test('resolve-url-deep', () => compareFiles('resolve-url-deep'));
});

describe('inline assets', () => {
  test('inline-asset-bypass-data-url', () => compareFiles('inline-asset-bypass-data-url'));
  test('query ?inline, method render', () => compareFiles('inline-asset-query'));
  test('svgo loader', () => compareFiles('inline-asset-query-svgo'));
  test('data-URL and inline-SVG in pug and css, method render', () => compareFiles('inline-asset-pug-css'));
  test('decide by size data-URL/inline-SVG or file, method render', () => compareFiles('inline-asset-decide-size'));
  test('data-URL and inline-SVG exclude fonts, method render', () => compareFiles('inline-asset-exclude-svg-fonts'));
});

describe('require in script tag', () => {
  test('method compile', () => compareFiles('require-scripts-compile'));
  test('method render', () => compareFiles('require-scripts-render'));
  test('method html', () => compareFiles('require-scripts-html'));
  test('require scripts with same name', () => compareFiles('require-scripts-same-src'));
});

describe('extras: responsive images', () => {
  test('responsive images in template', () => compareFiles('responsive-images'));
  test('require images in pug and in style', () => compareFiles('responsive-images-pug-scss'));
  test('require many duplicate images in pug and styles', () => compareFiles('responsive-images-many-duplicates'));
});

describe('special cases', () => {
  // // TODO: fix it. Note: in html bundler plugin it is already fixed.
  //test('resolve-manifest.json', () => compareFiles('resolve-manifest.json'));
  test('require-esm-script', () => compareFiles('require-esm-script'));
  test('js-import-image', () => compareFiles('js-import-image'));
  test('compile template function in js', () => compareFiles('js-tmpl-entry-js'));
});

// Test Messages
describe('warning tests', () => {
  test('duplicate scripts', () => {
    const containString = 'Duplicate scripts are not allowed';
    return stdoutContain('msg-warning-duplicate-scripts', containString);
  });

  test('duplicate scripts using alias', () => {
    const containString = 'Duplicate scripts are not allowed';
    return stdoutContain('msg-warning-duplicate-scripts-alias', containString);
  });

  test('duplicate styles', () => {
    const containString = 'Duplicate styles are not allowed';
    return stdoutContain('msg-warning-duplicate-styles', containString);
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

  test('exception: execute template function', () => {
    const containString = 'Failed to execute the template function';
    return exceptionContain('msg-exception-execute-template', containString);
  });

  test('exception: resolve required file', () => {
    const containString = `Can't resolve the file`;
    return exceptionContain( 'msg-exception-resolve-file', containString);
  });

  test('exception: @import CSS is not supported', () => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    return exceptionContain( 'msg-exception-import-css-rule', containString);
  });

  test('exception: option modules', () => {
    const containString = 'must be the array of';
    return exceptionContain('msg-exception-option-modules', containString);
  });

  test('exception: execute postprocess', () => {
    const containString = 'Postprocess is failed';
    return exceptionContain('msg-exception-execute-postprocess', containString);
  });

  test('exception: multiple chunks with same filename', () => {
    const containString = 'Multiple chunks emit assets to the same filename';
    return exceptionContain('msg-exception-multiple-chunks-same-filename', containString);
  });
});

describe('DEPRECATE tests', () => {
  test('deprecate-option-extractCss', () => {
    const containString = `Use the 'css' option name instead of 'extractCss'`;
    return stdoutContain('msg-deprecate-option-extractCss', containString);
  });
});
