(()=>{var t={427:t=>{function e(t,o){return Array.isArray(t)?function(t,r){for(var o,a="",i="",s=Array.isArray(r),c=0;c<t.length;c++)(o=e(t[c]))&&(s&&r[c]&&(o=n(o)),a=a+i+o,i=" ");return a}(t,o):t&&"object"==typeof t?function(t){var e="",n="";for(var o in t)o&&t[o]&&r.call(t,o)&&(e=e+n+o,n=" ");return e}(t):t||""}function n(t){var e=""+t,n=o.exec(e);if(!n)return t;var r,a,i,s="";for(r=n.index,a=0;r<e.length;r++){switch(e.charCodeAt(r)){case 34:i="&quot;";break;case 38:i="&amp;";break;case 60:i="&lt;";break;case 62:i="&gt;";break;default:continue}a!==r&&(s+=e.substring(a,r)),a=r+1,s+=i}return a!==r?s+e.substring(a,r):s}var r=Object.prototype.hasOwnProperty,o=/["&<>]/;t.exports=function(t){var r,o="",a=t||{};return function(t,a){o=o+"<button"+function(t,e,n,r){if(!1===e||null==e||!e)return"";if(!0===e)return" "+t;var o=typeof e;return"object"!==o&&"function"!==o||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||-1===(e=JSON.stringify(e)).indexOf('"')?' class="'+e+'"':" class='"+e.replace(/'/g,"&#39;")+"'"}("class",e([t],[!0]))+">"+n(null==(r=a)?"":r)+"</button>"}.call(this,"className"in a?a.className:"undefined"!=typeof className?className:void 0,"text"in a?a.text:"undefined"!=typeof text?text:void 0),o}}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var a=e[r]={exports:{}};return t[r](a,a.exports,n),a.exports}(()=>{const t=n(427);addEventListener("DOMContentLoaded",(e=>{console.log(">> main"),document.getElementById("root").innerHTML=t({text:"click me",className:"outline"})}))})()})();