const isFunction = (value) => typeof value === 'function';

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

const AUTO_PUBLIC_PATH = '__pug_plugin_public_path_auto__';
const ABSOLUTE_PUBLIC_PATH = 'webpack:///pug-plugin/';
const SINGLE_DOT_PATH_SEGMENT = '__pug_plugin_single_dot_path_segment__';

// todo Implement 'auto' publicPath, following is just research code from mini-css-extract-plugin:
const getPublicPath = (compilation) => {
  let { publicPath } = compilation.outputOptions || { publicPath: '' };
  /*if (typeof options.publicPath === 'string') {
    publicPath = options.publicPath;
  } else if (isFunction(options.publicPath)) {
    publicPath = options.publicPath(this.resourcePath, this.rootContext);
  }*/

  if (publicPath === 'auto') {
    publicPath = AUTO_PUBLIC_PATH;
  }

  const isAbsolutePublicPath = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(publicPath);
  const publicPathForExtract = isAbsolutePublicPath
    ? publicPath
    : `${ABSOLUTE_PUBLIC_PATH}${publicPath.replace(/\./g, SINGLE_DOT_PATH_SEGMENT)}`;

  return publicPathForExtract;
};

// todo Resolve 'auto' publicPath into real path, following is just research code from mini-css-extract-plugin:
function resolvePublicPath(filename, outputPath, enforceRelative) {
  let depth = -1;
  let append = '';

  outputPath = outputPath.replace(/[\\/]$/, '');

  for (const part of filename.split(/[/\\]+/)) {
    if (part === '..') {
      if (depth > -1) {
        depth--;
      } else {
        const i = outputPath.lastIndexOf('/');
        const j = outputPath.lastIndexOf('\\');
        const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j);

        if (pos < 0) return `${outputPath}/`;

        append = `${outputPath.slice(pos + 1)}/${append}`;
        outputPath = outputPath.slice(0, pos);
      }
    } else if (part !== '.') {
      depth++;
    }
  }

  return depth > 0 ? `${'../'.repeat(depth)}${append}` : enforceRelative ? `./${append}` : append;
}

module.exports = {
  isFunction,
  shallowEqual,
  AUTO_PUBLIC_PATH,
  ABSOLUTE_PUBLIC_PATH,
  SINGLE_DOT_PATH_SEGMENT,
  getPublicPath,
  resolvePublicPath,
};
