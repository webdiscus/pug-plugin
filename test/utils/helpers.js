import path from 'path';
import { readDirRecursiveSync, readTextFileSync } from './file';
import { compile } from './webpack';

export const getCompareFileList = function (receivedPath, expectedPath) {
  return {
    received: readDirRecursiveSync(receivedPath, false).sort(),
    expected: readDirRecursiveSync(expectedPath, false).sort(),
  };
};

export const getCompareFileContents = function (receivedFile, expectedFile, filter = /.(html|css|css.map)$/) {
  return filter.test(receivedFile) && filter.test(expectedFile)
    ? { received: readTextFileSync(receivedFile), expected: readTextFileSync(expectedFile) }
    : { received: '', expected: '' };
};

export const compareFileListAndContent = (PATHS, relTestCasePath, done) => {
  const absTestPath = path.join(PATHS.testOutput, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  compile(PATHS, relTestCasePath, {}).then(() => {
    const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
    expect(receivedFiles).toEqual(expectedFiles);

    expectedFiles.forEach((file) => {
      const { received, expected } = getCompareFileContents(
        path.join(webRootPath, file),
        path.join(expectedPath, file)
      );
      expect(received).toEqual(expected);
    });
    done();
  });
};

export const exceptionContain = function (PATHS, relTestCasePath, containString, done) {
  compile(PATHS, relTestCasePath, {})
    .then(() => {
      throw new Error('the test should throw an error');
    })
    .catch((error) => {
      expect(error.toString()).toContain(containString);
      done();
    });
};