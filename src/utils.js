/**
 * Converts the win path to POSIX standard.
 * The require() function understands only POSIX format.
 *
 * Fix path, for example:
 *   - `..\\some\\path\\file.js` to `../some/path/file.js`
 *   - `C:\\some\\path\\file.js` to `C:/some/path/file.js`
 *
 * @param {string} value The path on Windows.
 * @return {*}
 */
const pathToPosix = (value) => value.replace(/\\/g, '/');

const isFunction = (value) => typeof value === 'function';

const outToConsole = (...args) => process.stdout.write(args.join(' ') + '\n');

/**
 * Simple equal of two objects.
 *
 * @param {{}} obj1
 * @param {{}} obj2
 * @return {boolean}
 */
const shallowEqual = function (obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

module.exports = {
  pathToPosix,
  isFunction,
  shallowEqual,
  outToConsole,
};
