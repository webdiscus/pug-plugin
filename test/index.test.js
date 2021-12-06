import { compile } from './utils/webpack';

const path = require('path');
const rimraf = require('rimraf');

import colstr from '../src/color-string';
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

describe('color string tests', () => {
  const colorMethod = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const bgColorMethod = ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite'];

  colorMethod.forEach((color) => {
    test(`colstr.${color}`, (done) => {
      const str = 'ok';
      const received = colstr[color](str);
      const expected = `\x1b[${colstr.colors[color]}m` + str + `\x1b[${colstr.colors.reset}m`;
      expect(received).toEqual(expected);
      done();
    });
  });

  bgColorMethod.forEach((color) => {
    test(`colstr.${color}`, (done) => {
      const str = 'ok';
      const received = colstr[color](str);
      const expected = `\x1b[${colstr.colors[color]};${colstr.colors.white}m` + str + `\x1b[${colstr.colors.reset}m`;
      expect(received).toEqual(expected);
      done();
    });
  });
});

describe('integration tests', () => {
  test('Hello World! Zero config.', (done) => {
    compareFileListAndContent(PATHS, 'hello-world', done);
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

  test('entries: html, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-html-pug', done);
  });

  test('entries: sass, pug (production)', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-pug-prod', done);
  });

  test('entries: sass, pug (development)', (done) => {
    compareFileListAndContent(PATHS, 'entry-sass-pug-devel', done);
  });

  test('entry: js, pug', (done) => {
    compareFileListAndContent(PATHS, 'entry-js-pug', done);
  });
});

describe('exception tests', () => {
  test('exception: publicPath auto', (done) => {
    const relTestCasePath = 'exception-public-path';
    const containString = `This plugin yet not support 'auto' publicPath.`;
    exceptionContain(PATHS, relTestCasePath, containString, done);
  });

  test('exception: entry not found', (done) => {
    const relTestCasePath = 'exception-entry-not-found';
    const containString = 'is not found';
    exceptionContain(PATHS, relTestCasePath, containString, done);
  });

  test('exception: execute asset', (done) => {
    const relTestCasePath = 'exception-execute-asset';
    const containString = 'Asset source execution failed';
    exceptionContain(PATHS, relTestCasePath, containString, done);
  });

  test('exception: execute postprocess', (done) => {
    const relTestCasePath = 'exception-execute-postprocess';
    const containString = 'Postprocess execution failed';
    exceptionContain(PATHS, relTestCasePath, containString, done);
  });
});