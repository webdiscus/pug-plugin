const JSON5 = require('json5');

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

/**
 * Parse resource path and raw query from request.
 *
 * @param {string} request
 * @return {{resource: string, query: string|null}}
 */
const parseRequest = (request) => {
  const [resource, query] = request.split('?');
  return { resource, query };
};

/**
 * Parse request query.
 *
 * @param {string} request
 * @returns {{}}
 */
const parseQuery = (request) => {
  const [, query] = request.split('?');
  if (!query) return {};

  if (query[0] === '{' && query.slice(-1) === '}') {
    // TODO: write own micro parser to avoid external dependency of json5 module
    return JSON5.parse(decodeURIComponent(query));
  }

  const specialValues = {
    null: null,
    true: true,
    false: false,
  };
  const queryArgs = query.split(/[,&]/g);
  const result = {};

  for (let arg of queryArgs) {
    let [name, value] = arg.split('=');

    if (value) {
      value = decodeURIComponent(value);

      if (specialValues.hasOwnProperty(value)) {
        value = specialValues[value];
      }

      if (name.slice(-2) === '[]') {
        name = decodeURIComponent(name.slice(0, -2));
        if (!Array.isArray(result[name])) {
          result[name] = [];
        }
        result[name].push(value);
      } else {
        name = decodeURIComponent(name);
        result[name] = value;
      }
    }
  }

  return result;
};

module.exports = {
  parseQuery,
  pathToPosix,
  parseRequest,
  isFunction,
  shallowEqual,
  outToConsole,
};
