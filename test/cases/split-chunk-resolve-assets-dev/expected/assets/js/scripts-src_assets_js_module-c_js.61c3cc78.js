(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-src_assets_js_module-c_js"],{

/***/ "./src/assets/js/lib.js":
/*!******************************!*\
  !*** ./src/assets/js/lib.js ***!
  \******************************/
/***/ ((module) => {

const Lib = {
  methodA() {
    return 'module A';
  },
  methodB() {
    return 'module B';
  },
  methodC() {
    return 'common used module';
  },
};

module.exports = Lib;

/***/ }),

/***/ "./src/assets/js/module-c.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-c.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const lib = __webpack_require__(/*! ./lib */ "./src/assets/js/lib.js");
const value = lib.methodC();

module.exports = value;

/***/ })

}]);