(self.webpackChunk=self.webpackChunk||[]).push([[691],{0:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=function(e){let[,t]=/([a-f\d]{3,6})/i.exec(e)||[];const n=t?t.length:0;if(3===n)t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2];else if(6!==n)return[0,0,0];const r=parseInt(t,16);return[r>>16&255,r>>8&255,255&r]},r=(e,t,n)=>t>e?t:e>n?n:e,s=function(e,t,n){let r=e.indexOf(t);if(r<0)return e;const s=t.length;let o=0,i="";for(;~r;)i+=e.substr(o,r-o)+n,o=r+s,r=e.indexOf(t,o);return i+e.substr(o)},o=(e=>{const t=process||{},n=t.env||{},r=t.argv||[],s=t.stdout&&t.stdout.isTTY,o="NO_COLOR"in n||r.includes("--no-color")||r.includes("--color=false"),i="FORCE_COLOR"in n||r.includes("--color"),c="dumb"!==n.TERM&&/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM),g=s&&c||"win32"===t.platform;return!o&&(i||g||"CI"in n)})(),i={open:"",close:""},c=o?([e,t])=>({open:`[${e}m`,close:`[${t}m`}):()=>i,g={reset:c([0,0]),inverse:c([7,27]),hidden:c([8,28]),bold:c([1,22]),dim:c([2,22]),faint:c([2,22]),italic:c([3,23]),underline:c([4,24]),doubleUnderline:c([21,24]),strikethrough:c([9,29]),strike:c([9,29]),frame:c([51,54]),encircle:c([52,54]),overline:c([53,55]),black:c([30,39]),red:c([31,39]),green:c([32,39]),yellow:c([33,39]),blue:c([34,39]),magenta:c([35,39]),cyan:c([36,39]),white:c([37,39]),gray:c([90,39]),grey:c([90,39]),blackBright:c([90,39]),redBright:c([91,39]),greenBright:c([92,39]),yellowBright:c([93,39]),blueBright:c([94,39]),magentaBright:c([95,39]),cyanBright:c([96,39]),whiteBright:c([97,39]),bgBlack:c([40,49]),bgRed:c([41,49]),bgGreen:c([42,49]),bgYellow:c([43,49]),bgBlue:c([44,49]),bgMagenta:c([45,49]),bgCyan:c([46,49]),bgWhite:c([47,49]),bgBlackBright:c([100,49]),bgRedBright:c([101,49]),bgGreenBright:c([102,49]),bgYellowBright:c([103,49]),bgBlueBright:c([104,49]),bgMagentaBright:c([105,49]),bgCyanBright:c([106,49]),bgWhiteBright:c([107,49])},l={ansi256:o?e=>({open:`[38;5;${e}m`,close:"[39m"}):()=>i,bgAnsi256:o?e=>({open:`[48;5;${e}m`,close:"[49m"}):()=>i,rgb:o?(e,t,n)=>({open:`[38;2;${e};${t};${n}m`,close:"[39m"}):()=>i,bgRgb:o?(e,t,n)=>({open:`[48;2;${e};${t};${n}m`,close:"[49m"}):()=>i},p=/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;class u{constructor(){const e=e=>e;return e.strip=e=>e.replace(p,""),Object.setPrototypeOf(e,d),e}}const b={},a=/(\r*\n)/g,h=(e,t,n)=>{let r=e,o=t;void 0!==n&&(r=n.openStack+e,o=t+n.closeStack);const i=e=>((e,t)=>{if(!e)return"";const{openStack:n,closeStack:r}=t;if(~e.indexOf(""))for(;void 0!==t;)e=s(e,t.close,t.open),t=t.parent;return~e.indexOf("\n")&&(e=e.replace(a,r+"$1"+n)),n+e+r})(e,i.props);return Object.setPrototypeOf(i,d),i.props={open:e,close:t,openStack:r,closeStack:o,parent:n},i.open=r,i.close=o,i};for(let e in g){const{open:t,close:n}=g[e];b[e]={get(){const r=h(t,n,this.props);return Object.defineProperty(this,e,{value:r}),r}}}b.visible={get(){return h("","",this.props)}},b.ansi256={get(){return e=>{e=r(e,0,255);const{open:t,close:n}=l.ansi256(e);return h(t,n,this.props)}}},b.bgAnsi256={get(){return e=>{e=r(e,0,255);const{open:t,close:n}=l.bgAnsi256(e);return h(t,n,this.props)}}},b.rgb={get(){return(e,t,n)=>{e=r(e,0,255),t=r(t,0,255),n=r(n,0,255);const{open:s,close:o}=l.rgb(e,t,n);return h(s,o,this.props)}}},b.hex={get(){return e=>{const{open:t,close:r}=l.rgb(...n(e));return h(t,r,this.props)}}},b.bgRgb={get(){return(e,t,n)=>{e=r(e,0,255),t=r(t,0,255),n=r(n,0,255);const{open:s,close:o}=l.bgRgb(e,t,n);return h(s,o,this.props)}}},b.bgHex={get(){return e=>{const{open:t,close:r}=l.bgRgb(...n(e));return h(t,r,this.props)}}},b.ansi=b.ansi256,b.fg=b.ansi256,b.bgAnsi=b.bgAnsi256,b.bg=b.bgAnsi256;const d=Object.defineProperties((()=>{}),b),f=new u;t.Ansis=u,t.default=f},773:(e,t,n)=>{"use strict";const r=n(0);e.exports=r.default,e.exports.Ansis=r.Ansis},998:e=>{e.exports={methodA:()=>"A",methodB:()=>"B",methodC:()=>"C"}},691:(e,t,n)=>{const r=n(998),s=n(773);let o=r.methodB();o=s.strip(o),console.log(">> common used module <<"),e.exports=o}}]);