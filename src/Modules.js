// Modules available in both pug-plugin and pug-loader.
// These modules store data for exchange between the plugin and the loader.

const pugLoaderPath = '@webdiscus/pug-loader';

// For local development of pug-plugin and pug-loader only.
// Update path in both pug-loader/src/Modules.js and pug-plugin/src/Modules.js files.
//const pugLoaderPath = '../../pug-loader';

module.exports = require(pugLoaderPath + '/src/Modules.js');
module.exports.loader = require.resolve(pugLoaderPath);
