const path = require('path');
const ResourceResolver = require('./ResourceResolver');

/**
 * URL dependency resolver.
 * @singleton
 */
const UrlDependencyResolver = {
  fs: null,
  compilation: null,

  /**
   *
   * @param {fs: FileSystem} fs
   * @param {compilation: Compilation} compilation
   */
  init({ fs, moduleGraph }) {
    this.fs = fs;
    this.moduleGraph = moduleGraph;
  },

  /**
   * @param {Set<string>} files List of parent files/path in whose directory the resolved file can be.
   * @param {string} request The file to be resolved.
   * @returns {null|{file: string, context: string}}
   * @private
   */
  resolveInPaths(files, request) {
    const fs = this.fs;
    let context, file, tmpFile;
    for (tmpFile of files) {
      context = path.dirname(tmpFile);
      file = path.resolve(context, request);
      if (fs.existsSync(file)) {
        return {
          context,
          file,
        };
      }
    }

    return null;
  },

  /**
   * @param {{snapshot: {managedFiles: Set<string>, children: Set<{managedFiles: Set<string>}>}}} buildInfo
   * @param {string} resource The file to be resolved.
   * @returns {null|{file: string, context: string}}
   * @private
   */
  resolveInBuildInfo(buildInfo, resource) {
    const { snapshot } = buildInfo;
    const { managedFiles, children } = snapshot;
    let result;

    if (managedFiles != null && managedFiles.size > 0) {
      result = this.resolveInPaths(managedFiles, resource);
      if (result != null) {
        return result;
      }
    }

    if (children != null && children.size > 0) {
      for (let item of children) {
        const childrenManagedFiles = item.managedFiles;
        if (childrenManagedFiles != null && childrenManagedFiles.size > 0) {
          result = this.resolveInPaths(childrenManagedFiles, resource);
          if (result != null) {
            return result;
          }
        }
      }
    }

    return null;
  },

  /**
   * Resolves relative URL and URL in node_modules.
   *
   * @param {{}} resolveData The callback parameter for the hooks beforeResolve of NormalModuleFactory.
   */
  resolve(resolveData) {
    const fs = this.fs;
    const [resource, query] = resolveData.request.split('?');

    if (!fs.existsSync(path.resolve(resolveData.context, resource))) {
      const dependency = resolveData.dependencies[0];
      const parentModule = this.moduleGraph.getParentModule(dependency);
      const buildInfo = parentModule.buildInfo || {};
      const snapshot = buildInfo.snapshot || {};
      const dependencies = snapshot.fileTimestamps || snapshot.fileTshs;

      let context = resolveData.context;
      let resolvedFile;

      // 1. try to resolve relative path in context or in dependency directories
      if (dependencies != null && dependencies.size > 0) {
        const files = dependencies.keys();
        const cache = new Set();
        let file;

        for (file of files) {
          if (fs.lstatSync(file).isFile()) {
            let dir = path.dirname(file);
            if (cache.has(dir)) {
              // skip directory that is already checked and the resource was not resolved in this directory
              continue;
            }

            let tmpFile = path.resolve(dir, resource);
            if (fs.existsSync(tmpFile)) {
              context = dir;
              resolvedFile = tmpFile;
              break;
            }
            cache.add(dir);
          }
        }
      } else {
        context = resolveData.context;
        let tmpFile = path.resolve(context, resource);
        if (fs.existsSync(tmpFile)) {
          resolvedFile = tmpFile;
        }
      }

      // 2. try to resolve in node modules
      if (resolvedFile == null) {
        let res = this.resolveInBuildInfo(buildInfo, resource);
        if (res != null) {
          context = res.context;
          resolvedFile = res.file;
        }
      }

      if (resolvedFile != null) {
        const resolvedRequest = query ? resolvedFile + '?' + query : resolvedFile;
        resolveData.request = resolvedRequest;
        dependency.request = resolvedRequest;
        dependency.userRequest = resolvedRequest;
        ResourceResolver.addResolvedPath(context);
      }
    }
  },
};

module.exports = UrlDependencyResolver;
