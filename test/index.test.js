const path = require('path');
const rimraf = require('rimraf');

import { shallowEqual } from '../src/utils';
import { copyRecursiveSync } from './utils/file';
import { compareFileListAndContent, exceptionContain } from './utils/helpers';

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
  jest.setTimeout(2000);
});

describe('utils tests', () => {
  test('shallowEqual', (done) => {
    const received = shallowEqual({ a: 123, b: 'abc' }, { b: 'abc', a: 123 });
    expect(received).toBeTruthy();
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

  test('options.sourcePath and options.outputPath (default)', (done) => {
    compareFileListAndContent(PATHS, 'options-default-path', done);
  });

  test('options.sourcePath and options.outputPath', (done) => {
    compareFileListAndContent(PATHS, 'options-custom-path', done);
  });

  test('options.modules (extractCss)', (done) => {
    compareFileListAndContent(PATHS, 'options-modules-css', done);
  });
});

describe('integration tests', () => {
  test('Hello World! Zero config.', (done) => {
    compareFileListAndContent(PATHS, 'hello-world', done);
  });

  test('entry: html, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-html-pug', done);
  });

  // TODO: research why test in GitHub generate other filename - `styles.9790d61e.css`, but local is 'styles.ccc97e51.css'
  // test('entry: sass, pug (production)', (done) => {
  //   compareFileListAndContent(PATHS, 'entry-sass-pug-prod', done);
  // });

  test('entry: sass, pug (development)', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-pug-devel', done);
  });

  test('entry: sass css with sourceMap', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-source-map', done);
  });

  // TODO: bugfix the error `Multiple chunks emit assets to the same filename`
  test('entry: load styles from entry with same base names using generator', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-with-same-names', done);
  });

  test('entry: js, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-js-pug', done);
  });

  test('entry styles pass over to other plugin', (done) => {
    compareFileListAndContent(PATHS, 'entry-styles-pass-over', done);
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

  test('require assets in pug, method render', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-method-render', done);
  });

  test('require assets in pug, method html', (done) => {
    compareFileListAndContent(PATHS, 'require-assets-method-html', done);
  });

  test('require styles in pug', (done) => {
    compareFileListAndContent(PATHS, 'require-styles', done);
  });

  test('require styles in pug and use compiled styles from webpack entry', (done) => {
    compareFileListAndContent(PATHS, 'require-and-entry-styles', done);
  });
});

describe('exception tests', () => {
  test('exception: publicPath undefined', (done) => {
    const containString = `This plugin yet not support 'auto' or undefined`;
    exceptionContain(PATHS, 'exception-public-path-undefined', containString, done);
  });

  test('exception: publicPath auto', (done) => {
    const containString = `This plugin yet not support 'auto' or undefined`;
    exceptionContain(PATHS, 'exception-public-path-auto', containString, done);
  });

  test('exception: resolve required style', (done) => {
    const containString = `type: 'asset/resource'`;
    exceptionContain(PATHS, 'exception-require-css-in-pug', containString, done);
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