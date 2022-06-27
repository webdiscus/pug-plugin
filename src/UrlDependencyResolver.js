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
      const snapshot = parentModule.buildInfo.snapshot;
      const dependencies = snapshot.fileTimestamps || snapshot.fileTshs;
      let result;

      // resolve in dependencies
      if (dependencies != null && dependencies.size > 0) {
        result = this.resolveInPaths(dependencies.keys(), resource);
      }

      // resolve in node modules
      if (result == null) {
        result = this.resolveInSnapshot(snapshot, resource);
      }

      if (result != null) {
        const resolvedRequest = query ? result.file + '?' + query : result.file;
        resolveData.request = resolvedRequest;
        dependency.request = resolvedRequest;
        dependency.userRequest = resolvedRequest;
        ResourceResolver.addResolvedPath(result.context);
      }
    }
  },

  /**
   * @param {{managedFiles: Set<string>, children: Set<{managedFiles: Set<string>}>}} snapshot The Webpack SnapshotSummary of build info.
   * @param {string} resource The file to be resolved.
   * @returns {null|{file: string, context: string}}
   * @private
   */
  resolveInSnapshot(snapshot, resource) {
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
   * @param {Set<string>} files List of parent files/path in whose directory the resolved file can be.
   * @param {string} resource The file to be resolved.
   * @returns {null|{file: string, context: string}}
   * @private
   */
  resolveInPaths(files, resource) {
    const fs = this.fs;
    const cache = new Set();
    let context, file, tmpFile;

    for (tmpFile of files) {
      if (fs.lstatSync(tmpFile).isFile()) {
        context = path.dirname(tmpFile);
        if (cache.has(context)) {
          // skip directory that is already checked and the resource was not resolved in this directory
          continue;
        }

        file = path.resolve(context, resource);
        if (fs.existsSync(file)) {
          return {
            context,
            file,
          };
        }
        cache.add(context);
      }
    }

    return null;
  },
};

module.exports = UrlDependencyResolver;
