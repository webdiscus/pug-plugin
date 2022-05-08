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
    /** @type {FileSystem} fs */
    const { fs } = this;
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
   * @param {string} request The file to be resolved.
   * @returns {null|{file: string, context: string}}
   * @private
   */
  resolveInBuildInfo(buildInfo, request) {
    const self = this;
    const { snapshot } = buildInfo;
    const { managedFiles, children } = snapshot;
    let result;

    if (managedFiles != null && managedFiles.size > 0) {
      result = self.resolveInPaths(managedFiles, request);
      if (result != null) {
        return result;
      }
    }

    if (children != null && children.size > 0) {
      for (let item of children) {
        const childrenManagedFiles = item.managedFiles;
        if (childrenManagedFiles != null && childrenManagedFiles.size > 0) {
          result = self.resolveInPaths(childrenManagedFiles, request);
          if (result != null) {
            return result;
          }
        }
      }
    }

    return null;
  },

  /**
   * @param {{}} resolveData The callback parameter for the hooks beforeResolve of NormalModuleFactory.
   */
  resolve(resolveData) {
    const self = this;
    const fs = self.fs;
    const request = resolveData.request;

    if (!fs.existsSync(path.resolve(resolveData.context, request))) {
      const dependency = resolveData.dependencies[0];

      //const parentModule = dependency._parentModule || {};
      const parentModule = this.moduleGraph.getParentModule(dependency);

      const buildInfo = parentModule.buildInfo || {};
      const snapshot = buildInfo.snapshot || {};
      const issuers = snapshot.fileTimestamps || snapshot.fileTshs;
      /** @type {string} closest issuer that can import the resource */
      const closestIssuer = issuers != null && issuers.size > 0 ? Array.from(issuers.keys()).pop() : null;
      let context = closestIssuer ? path.dirname(closestIssuer) : resolveData.context;
      let resolvedFile;

      // 1. try to resolve relative path in context or in directory of the closest issuer
      let tmpFile = path.resolve(context, request);
      if (fs.existsSync(tmpFile)) {
        resolvedFile = tmpFile;
      } else {
        // 2. try to resolve in node modules
        let res = self.resolveInBuildInfo(buildInfo, request);
        if (res != null) {
          context = res.context;
          resolvedFile = res.file;
        }
      }

      if (resolvedFile != null) {
        resolveData.request = resolvedFile;
        dependency.request = resolvedFile;
        dependency.userRequest = resolvedFile;
        ResourceResolver.addResolvedPath(context);
      }
    }
  },
};

module.exports = UrlDependencyResolver;
