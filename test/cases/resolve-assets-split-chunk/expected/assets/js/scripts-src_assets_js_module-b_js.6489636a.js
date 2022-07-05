/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["scripts-src_assets_js_module-b_js"],{

/***/ "../../../node_modules/ansis/bundle.js":
/*!*********************************************!*\
  !*** ../../../node_modules/ansis/bundle.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("Object.defineProperty(exports, \"__esModule\", ({value:!0}));const e=function(e){let[,t]=/([a-f\\d]{3,6})/i.exec(e)||[];const r=t?t.length:0;if(3===r)t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2];else if(6!==r)return[0,0,0];const n=parseInt(t,16);return[n>>16&255,n>>8&255,255&n]},t=(e,t,r)=>t>e?t:e>r?r:e,r=function(e,t,r){let n=e.indexOf(t);if(n<0)return e;const o=t.length;let s=0,i=\"\";for(;~n;)i+=e.substr(s,n-s)+r,s=n+o,n=e.indexOf(t,s);return i+e.substr(s)},n=(e=>{const t=e||(process||{}),r=t.env||{},n=t.argv||[],o=t.stdout&&t.stdout.isTTY,s=\"NO_COLOR\"in r||n.includes(\"--no-color\")||n.includes(\"--color=false\"),i=\"FORCE_COLOR\"in r||n.includes(\"--color\"),c=\"dumb\"!==r.TERM&&/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM),g=o&&c||\"win32\"===t.platform;return!s&&(i||g||\"CI\"in r)})(),o={open:\"\",close:\"\"},s=n?([e,t])=>({open:`\u001b[${e}m`,close:`\u001b[${t}m`}):()=>o,i={reset:s([0,0]),inverse:s([7,27]),hidden:s([8,28]),bold:s([1,22]),dim:s([2,22]),faint:s([2,22]),italic:s([3,23]),underline:s([4,24]),doubleUnderline:s([21,24]),strikethrough:s([9,29]),strike:s([9,29]),frame:s([51,54]),encircle:s([52,54]),overline:s([53,55]),black:s([30,39]),red:s([31,39]),green:s([32,39]),yellow:s([33,39]),blue:s([34,39]),magenta:s([35,39]),cyan:s([36,39]),white:s([37,39]),gray:s([90,39]),grey:s([90,39]),blackBright:s([90,39]),redBright:s([91,39]),greenBright:s([92,39]),yellowBright:s([93,39]),blueBright:s([94,39]),magentaBright:s([95,39]),cyanBright:s([96,39]),whiteBright:s([97,39]),bgBlack:s([40,49]),bgRed:s([41,49]),bgGreen:s([42,49]),bgYellow:s([43,49]),bgBlue:s([44,49]),bgMagenta:s([45,49]),bgCyan:s([46,49]),bgWhite:s([47,49]),bgBlackBright:s([100,49]),bgRedBright:s([101,49]),bgGreenBright:s([102,49]),bgYellowBright:s([103,49]),bgBlueBright:s([104,49]),bgMagentaBright:s([105,49]),bgCyanBright:s([106,49]),bgWhiteBright:s([107,49])},c={ansi256:n?e=>({open:`\u001b[38;5;${e}m`,close:\"\u001b[39m\"}):()=>o,bgAnsi256:n?e=>({open:`\u001b[48;5;${e}m`,close:\"\u001b[49m\"}):()=>o,rgb:n?(e,t,r)=>({open:`\u001b[38;2;${e};${t};${r}m`,close:\"\u001b[39m\"}):()=>o,bgRgb:n?(e,t,r)=>({open:`\u001b[48;2;${e};${t};${r}m`,close:\"\u001b[49m\"}):()=>o},g=/[\\u001b\\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;class l{constructor(){const e=e=>e;return e.strip=e=>e.replace(g,\"\"),Object.setPrototypeOf(e,a),e}}const p={},b=/(\\r*\\n)/g,u=(e,t,n)=>{let o=e,s=t;void 0!==n&&(o=n.openStack+e,s=t+n.closeStack);const i=e=>((e,t)=>{if(!e)return\"\";const{openStack:n,closeStack:o}=t;if(~e.indexOf(\"\u001b\"))for(;void 0!==t;)e=r(e,t.close,t.open),t=t.parent;return~e.indexOf(\"\\n\")&&(e=e.replace(b,o+\"$1\"+n)),n+e+o})(e,i.props);return Object.setPrototypeOf(i,a),i.props={open:e,close:t,openStack:o,closeStack:s,parent:n},i.open=o,i.close=s,i};for(let e in i){const{open:t,close:r}=i[e];p[e]={get(){const n=u(t,r,this.props);return Object.defineProperty(this,e,{value:n}),n}}}p.visible={get(){return u(\"\",\"\",this.props)}},p.ansi256={get(){return e=>{e=t(e,0,255);const{open:r,close:n}=c.ansi256(e);return u(r,n,this.props)}}},p.bgAnsi256={get(){return e=>{e=t(e,0,255);const{open:r,close:n}=c.bgAnsi256(e);return u(r,n,this.props)}}},p.rgb={get(){return(e,r,n)=>{e=t(e,0,255),r=t(r,0,255),n=t(n,0,255);const{open:o,close:s}=c.rgb(e,r,n);return u(o,s,this.props)}}},p.hex={get(){return t=>{const{open:r,close:n}=c.rgb(...e(t));return u(r,n,this.props)}}},p.bgRgb={get(){return(e,r,n)=>{e=t(e,0,255),r=t(r,0,255),n=t(n,0,255);const{open:o,close:s}=c.bgRgb(e,r,n);return u(o,s,this.props)}}},p.bgHex={get(){return t=>{const{open:r,close:n}=c.bgRgb(...e(t));return u(r,n,this.props)}}},p.ansi=p.ansi256,p.fg=p.ansi256,p.bgAnsi=p.bgAnsi256,p.bg=p.bgAnsi256;const a=Object.defineProperties((()=>{}),p),h=new l;exports.Ansis=l,exports[\"default\"]=h;\n\n\n//# sourceURL=webpack:///../../../node_modules/ansis/bundle.js?");

/***/ }),

/***/ "../../../node_modules/ansis/index.js":
/*!********************************************!*\
  !*** ../../../node_modules/ansis/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst bundle = __webpack_require__(/*! ./bundle.js */ \"../../../node_modules/ansis/bundle.js\");\nmodule.exports = bundle.default;\nmodule.exports.Ansis = bundle.Ansis;\n\n\n//# sourceURL=webpack:///../../../node_modules/ansis/index.js?");

/***/ }),

/***/ "./src/assets/js/lib.js":
/*!******************************!*\
  !*** ./src/assets/js/lib.js ***!
  \******************************/
/***/ ((module) => {

eval("const Lib = {\n  methodA() {\n    return 'A';\n  },\n  methodB() {\n    return 'B';\n  },\n  methodC() {\n    return 'C';\n  },\n};\n\nmodule.exports = Lib;\n\n//# sourceURL=webpack:///./src/assets/js/lib.js?");

/***/ }),

/***/ "./src/assets/js/module-b.js":
/*!***********************************!*\
  !*** ./src/assets/js/module-b.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const lib = __webpack_require__(/*! ./lib */ \"./src/assets/js/lib.js\");\nconst ansis = __webpack_require__(/*! ansis */ \"../../../node_modules/ansis/index.js\");\nlet value = lib.methodB();\nvalue = ansis.strip(value);\n\nmodule.exports = value;\n\n//# sourceURL=webpack:///./src/assets/js/module-b.js?");

/***/ })

}]);