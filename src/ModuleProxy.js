// Proxy modules available in both pug-plugin and pug-loader.
// These modules store data for exchange between the plugin and the loader.

const pugLoaderPath = '@webdiscus/pug-loader';

// For local development of pug-plugin and pug-loader only.
// Update path in both pug-loader/src/ModuleProxy.js and pug-plugin/src/ModuleProxy.js files.
//const pugLoaderPath = '../../pug-loader';

module.exports = {
  loader: require.resolve(pugLoaderPath),
  plugin: require(pugLoaderPath + '/src/Plugin.js'),
  scriptStore: require(pugLoaderPath + '/src/ScriptStore.js'),
};
