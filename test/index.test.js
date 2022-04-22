const path = require('path');
const rimraf = require('rimraf');

import { shallowEqual } from '../src/utils';
import { copyRecursiveSync } from './utils/file';
import { compareFileListAndContent, exceptionContain } from './utils/helpers';
import { PugPluginError, PugPluginException } from '../src/exceptions';

const AssetEntry = require('../src/AssetEntry');

// The base path of test directory.
const basePath = path.resolve(__dirname, './');

const PATHS = {
  base: basePath,
  testSource: path.join(basePath, 'cases'),
  // absolute path of temp outputs for test
  testOutput: path.join(basePath, 'output'),
  // relative path in the test directory to web root dir name, same as by a web server (e.g. nginx)
  webRoot: '/public/',
  // relative path in the test directory to expected files for test
  expected: '/expected/',
  // relative path in the public directory
  output: '/assets/',
  assets: '/public/assets/',
};

beforeAll(() => {
  // delete all files from path
  rimraf.sync(PATHS.testOutput);
  // copy test files to temp directory
  copyRecursiveSync(PATHS.testSource, PATHS.testOutput);
});

beforeEach(() => {
  jest.setTimeout(5000);
});

describe('utils tests', () => {
  test('shallowEqual same', (done) => {
    const received = shallowEqual({ a: 123, b: 'abc' }, { b: 'abc', a: 123 });
    expect(received).toBeTruthy();
    done();
  });

  test('shallowEqual different size', (done) => {
    const received = shallowEqual({ a: 123 }, { b: 'abc', a: 123 });
    expect(received).toBeFalsy();
    done();
  });

  test('shallowEqual different value', (done) => {
    const received = shallowEqual({ a: 123, b: 'abc' }, { b: 'cba', a: 123 });
    expect(received).toBeFalsy();
    done();
  });
});

describe('AssetEntry tests', () => {
  test('isEntryModule', (done) => {
    const received = AssetEntry.isEntryModule({});
    expect(received).toBeFalsy();
    done();
  });

  test('resetAdditionalEntries', (done) => {
    AssetEntry.addedToCompilationEntryNames = ['home', 'about'];
    AssetEntry.resetAdditionalEntries();
    const received = AssetEntry.addedToCompilationEntryNames;
    expect(received).toEqual([]);
    done();
  });
});

describe('options', () => {
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

  test('options.outputPath', (done) => {
    compareFileListAndContent(PATHS, 'options-outputpath', done);
  });

  test('options.pretty', (done) => {
    compareFileListAndContent(PATHS, 'options-pretty', done);
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

  test('entry: sass resolve url with `resolve-url-loader`', (done) => {
    // tested for: compile, render
    compareFileListAndContent(PATHS, 'entry-sass-resolve-url-loader', done);
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
    compareFileListAndContent(PATHS, 'require-data-method-compile', done);
  });

  test('entry: pug require data, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-data-method-render', done);
  });

  test('entry: pug require data, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-data-method-html', done);
  });

  test('entry: alias resolve.plugins, method compile', (done) => {
    compareFileListAndContent(PATHS, 'entry-alias-resolve.plugins-compile', done);
  });
});

describe('require assets tests', () => {
  test('require fonts in pug', (done) => {
    compareFileListAndContent(PATHS, 'require-fonts', done);
  });

  test('require images in pug, method compile', (done) => {
    compareFileListAndContent(PATHS, 'require-images-compile', done);
  });

  test('require images in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-images-render', done);
  });

  test('require images via responsive-loader', (done) => {
    compareFileListAndContent(PATHS, 'require-responsive-images', done);
  });

  test('require assets in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-method-render', done);
  });

  test('require assets in pug, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-method-html', done);
  });

  test('require styles in pug', (done) => {
    compareFileListAndContent(PATHS, 'require-styles', done);
  });

  test('require styles with same name', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-with-same-name', done);
  });

  test('require styles with same name, hash', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-with-same-name-hash', done);
  });

  test('require styles with relative path in url', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-url-relative', done);
  });

  test('require styles with alias in url', (done) => {
    compareFileListAndContent(PATHS, 'require-styles-url-alias', done);
  });

  test('require styles in pug and use compiled styles from webpack entry', (done) => {
    compareFileListAndContent(PATHS, 'require-and-entry-styles', done);
  });

  test('require css in pug and resolve in css the url(image), method render', (done) => {
    compareFileListAndContent(PATHS, 'require-css-image-render', done);
  });

  // TODO: fix the issue
  // test('require css in pug and resolve in css the url(image), method html', (done) => {
  //   compareFileListAndContent(PATHS, 'require-css-image-html', done);
  // });
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

  test('exception: publicPath undefined', (done) => {
    const containString = `This plugin yet not support 'auto' or undefined`;
    exceptionContain(PATHS, 'exception-public-path-undefined', containString, done);
  });

  test('exception: publicPath auto', (done) => {
    const containString = `This plugin yet not support 'auto' or undefined`;
    exceptionContain(PATHS, 'exception-public-path-auto', containString, done);
  });

  test('exception: execute template function', (done) => {
    const containString = 'Failed to execute template function';
    exceptionContain(PATHS, 'exception-execute-template', containString, done);
  });

  test('exception: resolve required file', (done) => {
    const containString = `Can't resolve the file`;
    exceptionContain(PATHS, 'exception-resolve-file', containString, done);
  });

  test('exception: @import CSS is not supported', (done) => {
    const containString = `Avoid CSS imports`;
    exceptionContain(PATHS, 'exception-import-css-rule', containString, done);
  });

  test('exception: option modules', (done) => {
    const containString = 'must be the array of';
    exceptionContain(PATHS, 'exception-option-modules', containString, done);
  });

  test('exception: execute postprocess', (done) => {
    const containString = 'Postprocess execution failed';
    exceptionContain(PATHS, 'exception-execute-postprocess', containString, done);
  });
});