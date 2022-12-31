import path from 'path';
import { compareFileListAndContent, exceptionContain, stdoutContain } from './utils/helpers';
import { PugPluginError, PugPluginException } from '../src/Exceptions';
import { parseQuery } from '../src/Utils';
import AssetEntry from '../src/AssetEntry';

const PATHS = {
  base: __dirname,
  testSource: path.join(__dirname, 'cases'),
  // relative path in the test directory to web root dir name, same as by a web server (e.g. nginx)
  //webRoot: '/public/',
  webRoot: '/dist/',
  // relative path in the test directory to expected files for test
  expected: '/expected/',
  // relative path in the public directory
  output: '/assets/',
};

const testTimeout = 5000;

beforeAll(() => {});

beforeEach(() => {
  // on linux/macOS not work set the testTimeout in jest.config.js
  jest.setTimeout(testTimeout);
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
  test('output.publicPath = auto', (done) => {
    compareFileListAndContent(PATHS, 'options-output-public-path-auto', done);
  });

  test('output.publicPath = function', (done) => {
    compareFileListAndContent(PATHS, 'options-output-public-path-function', done);
  });

  test('output.filename', (done) => {
    compareFileListAndContent(PATHS, 'options-output-filename', done);
  });

  test('options.enabled = false', (done) => {
    compareFileListAndContent(PATHS, 'options-enabled', done);
  });

  test('options.test (extensions)', (done) => {
    compareFileListAndContent(PATHS, 'options-extension-test', done);
  });

  test('options.filename as template', (done) => {
    compareFileListAndContent(PATHS, 'options-filename-template', done);
  });

  test('options.filename as function', (done) => {
    compareFileListAndContent(PATHS, 'options-filename-function', done);
  });

  test('options.filename as function for separate assets', (done) => {
    compareFileListAndContent(PATHS, 'options-filename-separate-assets', done);
  });

  test('options.sourcePath and options.outputPath (default)', (done) => {
    compareFileListAndContent(PATHS, 'options-default-path', done);
  });

  test('options.sourcePath and options.outputPath', (done) => {
    compareFileListAndContent(PATHS, 'options-custom-path', done);
  });

  test('options.modules (extractCss)', (done) => {
    compareFileListAndContent(PATHS, 'options-modules-css', done);
  });

  test('options.modules.postprocess', (done) => {
    compareFileListAndContent(PATHS, 'options-modules-postprocess', done);
  });

  test('options.postprocess', (done) => {
    compareFileListAndContent(PATHS, 'options-postprocess', done);
  });

  test('options module pug outputPath', (done) => {
    compareFileListAndContent(PATHS, 'options-pug-outputPath', done);
  });

  test('options modules js, css outputPath relative', (done) => {
    compareFileListAndContent(PATHS, 'options-js-css-outputPath-relative', done);
  });

  test('options modules js, css outputPath absolute', (done) => {
    compareFileListAndContent(PATHS, 'options-js-css-outputPath-absolute', done);
  });

  test('options.pretty', (done) => {
    compareFileListAndContent(PATHS, 'options-pretty', done);
  });

  test('options.verbose', (done) => {
    compareFileListAndContent(PATHS, 'options-verbose', done);
  });

  test('options.extractComments = false', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-false', done);
  });

  test('options.extractComments = true', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-true', done);
  });

  test('default webpack config', (done) => {
    compareFileListAndContent(PATHS, 'webpack-config-default', done);
  });

  test('options-js-filename', (done) => {
    compareFileListAndContent(PATHS, 'options-js-filename', done);
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
  test('Hello World! Zero config.', (done) => {
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
  test('entry: css data-url', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-data-url', done);
  });

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

  test('@import url() in SCSS', (done) => {
    compareFileListAndContent(PATHS, 'extract-css-import-url', done);
  });

  test('@import url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-css', done);
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

  test('require styles in pug', (done) => {
    compareFileListAndContent(PATHS, 'require-styles', done);
  });

  test('require styles in pug from node_modules', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-from-module', done);
  });

  test('require styles in pug from node_modules with .ext in module name', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-from-module.ext', done);
  });

  test('require styles with same name', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-with-same-name', done);
  });

  test('require styles with same name, hash', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-with-same-name-hash', done);
  });

  test('require styles in pug and use compiled styles from webpack entry', (done) => {
    compareFileListAndContent(PATHS, 'require-and-entry-styles', done);
  });

  test('require css in pug and resolve in css the url(image), method render', (done) => {
    compareFileListAndContent(PATHS, 'require-css-image-render', done);
  });

  test('require same asset with different raw request', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-same-pug-scss', done);
  });

  test('multiple-chunks-same-filename', (done) => {
    compareFileListAndContent(PATHS, 'multiple-chunks-same-filename', done);
  });

  // TODO: fix the issue
  // test('require css in pug and resolve in css the url(image), method html', (done) => {
  //   compareFileListAndContent(PATHS, 'require-css-image-html', done);
  // });
});

describe('inline', () => {
  test('require inline style', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-inline', done);
  });

  test('require inline style with source-map', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-inline-source-map', done);
  });

  test('require inline style with inline-source-map', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-inline-source-map-inline', done);
  });

  test('require inline style and style as file', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-inline-and-file', done);
  });

  test('resolve URL', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-inline-resolve-url', done);
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
  test('resolve assets when used split chunk, development', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-dev', done);
  });

  test('resolve assets when used split chunk, production', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-prod', done);
  });

  test('import source scripts and styles from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-source', done);
  });

  test('import source scripts and styles from many node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-many-vendors', done);
  });

  test('load vendor scripts from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-vendor', done);
  });

  test('extract css and js w/o runtime code of css-loader', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-css-js', done);
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

describe('responsive images', () => {
  test('require images in pug', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images', done);
  });

  test('require many duplicate images in pug and styles', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-many-duplicates', done);
  });

  test('require images in pug and in style', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-pug-scss', done);
  });
});

describe('inline assets', () => {
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

describe('warning tests', () => {
  test('duplicate scripts', (done) => {
    const containString = 'Duplicate scripts are not allowed';
    stdoutContain(PATHS, 'warning-duplicate-scripts', containString, done);
  });

  test('duplicate scripts using alias', (done) => {
    const containString = 'Duplicate scripts are not allowed';
    stdoutContain(PATHS, 'warning-duplicate-scripts-alias', containString, done);
  });

  test('duplicate styles', (done) => {
    const containString = 'Duplicate styles are not allowed';
    stdoutContain(PATHS, 'warning-duplicate-styles', containString, done);
  });
});

describe('exception tests', () => {
  test('exception test: previous error', (done) => {
    const containString = 'previous error';

    try {
      PugPluginError('previous error');
    } catch (error) {
      try {
        PugPluginError('last error', error);
      } catch (error) {
        expect(error.toString()).toContain(containString);
        done();
      }
    }
  });

  test('exception test: nested exceptions', (done) => {
    const containString = 'last error';

    const originalError = new PugPluginException('original error');
    try {
      PugPluginError('previous error', originalError);
    } catch (error) {
      try {
        PugPluginError('last error', error);
      } catch (error) {
        expect(error.toString()).toContain(containString);
        done();
      }
    }
  });

  test('exception: execute template function', (done) => {
    const containString = 'Failed to execute the template function';
    exceptionContain(PATHS, 'exception-execute-template', containString, done);
  });

  test('exception: resolve required file', (done) => {
    const containString = `Can't resolve the file`;
    exceptionContain(PATHS, 'exception-resolve-file', containString, done);
  });

  test('exception: @import CSS is not supported', (done) => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    exceptionContain(PATHS, 'exception-import-css-rule', containString, done);
  });

  test('exception: option modules', (done) => {
    const containString = 'must be the array of';
    exceptionContain(PATHS, 'exception-option-modules', containString, done);
  });

  test('exception: execute postprocess', (done) => {
    const containString = 'Postprocess is failed';
    exceptionContain(PATHS, 'exception-execute-postprocess', containString, done);
  });

  test('exception: multiple chunks with same filename', (done) => {
    const containString = 'Multiple chunks emit assets to the same filename';
    exceptionContain(PATHS, 'exception-multiple-chunks-same-filename', containString, done);
  });
});