"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[80],{3832:(e,t,n)=>{n.d(t,{fi:()=>w,kZ:()=>b});var r=n(8934),o=n(1004),i=n(6441),a=n(7002),s=n(7123),f=n(1085),c=n(1277),p=n(1005),u=n(959);function d(e,t,n){void 0===n&&(n=!1);var d,l,m=(0,a.Re)(t),v=(0,a.Re)(t)&&function(e){var t=e.getBoundingClientRect(),n=(0,u.NM)(t.width)/e.offsetWidth||1,r=(0,u.NM)(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(t),h=(0,c.Z)(t),Z=(0,r.Z)(e,v),g={scrollLeft:0,scrollTop:0},y={x:0,y:0};return(m||!m&&!n)&&(("body"!==(0,s.Z)(t)||(0,p.Z)(h))&&(g=(d=t)!==(0,i.Z)(d)&&(0,a.Re)(d)?{scrollLeft:(l=d).scrollLeft,scrollTop:l.scrollTop}:(0,o.Z)(d)),(0,a.Re)(t)?((y=(0,r.Z)(t,!0)).x+=t.clientLeft,y.y+=t.clientTop):h&&(y.x=(0,f.Z)(h))),{x:Z.left+g.scrollLeft-y.x,y:Z.top+g.scrollTop-y.y,width:Z.width,height:Z.height}}var l=n(471),m=n(7636),v=n(9264),h=n(9399);function Z(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}var g={placement:"bottom",modifiers:[],strategy:"absolute"};function y(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"==typeof e.getBoundingClientRect)}))}function b(e){void 0===e&&(e={});var t=e,n=t.defaultModifiers,r=void 0===n?[]:n,o=t.defaultOptions,i=void 0===o?g:o;return function(e,t,n){void 0===n&&(n=i);var o,s,f={placement:"bottom",orderedModifiers:[],options:Object.assign({},g,i),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},c=[],p=!1,u={state:f,setOptions:function(n){var o="function"==typeof n?n(f.options):n;b(),f.options=Object.assign({},i,f.options,o),f.scrollParents={reference:(0,a.kK)(e)?(0,m.Z)(e):e.contextElement?(0,m.Z)(e.contextElement):[],popper:(0,m.Z)(t)};var s,p,d=function(e){var t=Z(e);return h.xs.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(r,f.options.modifiers),p=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(p).map((function(e){return p[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,o=e.effect;if("function"==typeof o){var i=o({state:f,name:t,instance:u,options:r});c.push(i||function(){})}})),u.update()},forceUpdate:function(){if(!p){var e=f.elements,t=e.reference,n=e.popper;if(y(t,n)){f.rects={reference:d(t,(0,v.Z)(n),"fixed"===f.options.strategy),popper:(0,l.Z)(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<f.orderedModifiers.length;r++)if(!0!==f.reset){var o=f.orderedModifiers[r],i=o.fn,a=o.options,s=void 0===a?{}:a,c=o.name;"function"==typeof i&&(f=i({state:f,options:s,name:c,instance:u})||f)}else f.reset=!1,r=-1}}},update:(o=function(){return new Promise((function(e){u.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(o())}))}))),s}),destroy:function(){b(),p=!0}};if(!y(e,t))return u;function b(){c.forEach((function(e){return e()})),c=[]}return u.setOptions(n).then((function(e){!p&&n.onFirstUpdate&&n.onFirstUpdate(e)})),u}}var w=b()},1996:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(7002);function o(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&(0,r.Zq)(n)){var o=t;do{if(o&&e.isSameNode(o))return!0;o=o.parentNode||o.host}while(o)}return!1}},8934:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(7002),o=n(959);function i(e,t){void 0===t&&(t=!1);var n=e.getBoundingClientRect(),i=1,a=1;if((0,r.Re)(e)&&t){var s=e.offsetHeight,f=e.offsetWidth;f>0&&(i=(0,o.NM)(n.width)/f||1),s>0&&(a=(0,o.NM)(n.height)/s||1)}return{width:n.width/i,height:n.height/a,top:n.top/a,right:n.right/i,bottom:n.bottom/a,left:n.left/i,x:n.left/i,y:n.top/a}}},3578:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(6441);function o(e){return(0,r.Z)(e).getComputedStyle(e)}},1277:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(7002);function o(e){return(((0,r.kK)(e)?e.ownerDocument:e.document)||window.document).documentElement}},471:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(8934);function o(e){var t=(0,r.Z)(e),n=e.offsetWidth,o=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-o)<=1&&(o=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:o}}},7123:(e,t,n)=>{function r(e){return e?(e.nodeName||"").toLowerCase():null}n.d(t,{Z:()=>r})},9264:(e,t,n)=>{n.d(t,{Z:()=>p});var r=n(6441),o=n(7123),i=n(3578),a=n(7002);function s(e){return["table","td","th"].indexOf((0,o.Z)(e))>=0}var f=n(8021);function c(e){return(0,a.Re)(e)&&"fixed"!==(0,i.Z)(e).position?e.offsetParent:null}function p(e){for(var t=(0,r.Z)(e),n=c(e);n&&s(n)&&"static"===(0,i.Z)(n).position;)n=c(n);return n&&("html"===(0,o.Z)(n)||"body"===(0,o.Z)(n)&&"static"===(0,i.Z)(n).position)?t:n||function(e){var t=-1!==navigator.userAgent.toLowerCase().indexOf("firefox");if(-1!==navigator.userAgent.indexOf("Trident")&&(0,a.Re)(e)&&"fixed"===(0,i.Z)(e).position)return null;var n=(0,f.Z)(e);for((0,a.Zq)(n)&&(n=n.host);(0,a.Re)(n)&&["html","body"].indexOf((0,o.Z)(n))<0;){var r=(0,i.Z)(n);if("none"!==r.transform||"none"!==r.perspective||"paint"===r.contain||-1!==["transform","perspective"].indexOf(r.willChange)||t&&"filter"===r.willChange||t&&r.filter&&"none"!==r.filter)return n;n=n.parentNode}return null}(e)||t}},8021:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(7123),o=n(1277),i=n(7002);function a(e){return"html"===(0,r.Z)(e)?e:e.assignedSlot||e.parentNode||((0,i.Zq)(e)?e.host:null)||(0,o.Z)(e)}},6441:(e,t,n)=>{function r(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}n.d(t,{Z:()=>r})},1004:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(6441);function o(e){var t=(0,r.Z)(e);return{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}},1085:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(8934),o=n(1277),i=n(1004);function a(e){return(0,r.Z)((0,o.Z)(e)).left+(0,i.Z)(e).scrollLeft}},7002:(e,t,n)=>{n.d(t,{Re:()=>i,Zq:()=>a,kK:()=>o});var r=n(6441);function o(e){return e instanceof(0,r.Z)(e).Element||e instanceof Element}function i(e){return e instanceof(0,r.Z)(e).HTMLElement||e instanceof HTMLElement}function a(e){return"undefined"!=typeof ShadowRoot&&(e instanceof(0,r.Z)(e).ShadowRoot||e instanceof ShadowRoot)}},1005:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(3578);function o(e){var t=(0,r.Z)(e),n=t.overflow,o=t.overflowX,i=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+i+o)}},7636:(e,t,n)=>{n.d(t,{Z:()=>c});var r=n(8021),o=n(1005),i=n(7123),a=n(7002);function s(e){return["html","body","#document"].indexOf((0,i.Z)(e))>=0?e.ownerDocument.body:(0,a.Re)(e)&&(0,o.Z)(e)?e:s((0,r.Z)(e))}var f=n(6441);function c(e,t){var n;void 0===t&&(t=[]);var i=s(e),a=i===(null==(n=e.ownerDocument)?void 0:n.body),p=(0,f.Z)(i),u=a?[p].concat(p.visualViewport||[],(0,o.Z)(i)?i:[]):i,d=t.concat(u);return a?d:d.concat(c((0,r.Z)(u)))}},9399:(e,t,n)=>{n.d(t,{BL:()=>c,Ct:()=>h,DH:()=>w,F2:()=>i,I:()=>o,MS:()=>j,N7:()=>Z,Pj:()=>d,XM:()=>b,YP:()=>m,bw:()=>v,cW:()=>k,d7:()=>s,ij:()=>g,iv:()=>O,k5:()=>l,mv:()=>f,r5:()=>y,t$:()=>a,ut:()=>p,wX:()=>x,we:()=>r,xs:()=>M,zV:()=>u});var r="top",o="bottom",i="right",a="left",s="auto",f=[r,o,i,a],c="start",p="end",u="clippingParents",d="viewport",l="popper",m="reference",v=f.reduce((function(e,t){return e.concat([t+"-"+c,t+"-"+p])}),[]),h=[].concat(f,[s]).reduce((function(e,t){return e.concat([t,t+"-"+c,t+"-"+p])}),[]),Z="beforeRead",g="read",y="afterRead",b="beforeMain",w="main",x="afterMain",O="beforeWrite",k="write",j="afterWrite",M=[Z,g,y,b,w,x,O,k,j]},935:(e,t,n)=>{n.r(t),n.d(t,{afterMain:()=>r.wX,afterRead:()=>r.r5,afterWrite:()=>r.MS,applyStyles:()=>o.Z,arrow:()=>i.Z,auto:()=>r.d7,basePlacements:()=>r.mv,beforeMain:()=>r.XM,beforeRead:()=>r.N7,beforeWrite:()=>r.iv,bottom:()=>r.I,clippingParents:()=>r.zV,computeStyles:()=>a.Z,createPopper:()=>v.fi,createPopperBase:()=>l.fi,createPopperLite:()=>Z,detectOverflow:()=>m.Z,end:()=>r.ut,eventListeners:()=>s.Z,flip:()=>f.Z,hide:()=>c.Z,left:()=>r.t$,main:()=>r.DH,modifierPhases:()=>r.xs,offset:()=>p.Z,placements:()=>r.Ct,popper:()=>r.k5,popperGenerator:()=>l.kZ,popperOffsets:()=>u.Z,preventOverflow:()=>d.Z,read:()=>r.ij,reference:()=>r.YP,right:()=>r.F2,start:()=>r.BL,top:()=>r.we,variationPlacements:()=>r.bw,viewport:()=>r.Pj,write:()=>r.cW});var r=n(9399),o=n(6887),i=n(6868),a=n(4656),s=n(5128),f=n(8570),c=n(6545),p=n(4507),u=n(8061),d=n(9405),l=n(3832),m=n(6973),v=n(1511),h=[s.Z,u.Z,a.Z,o.Z],Z=(0,l.kZ)({defaultModifiers:h})},6887:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(7123),o=n(7002);const i={name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},i=t.attributes[e]||{},a=t.elements[e];(0,o.Re)(a)&&(0,r.Z)(a)&&(Object.assign(a.style,n),Object.keys(i).forEach((function(e){var t=i[e];!1===t?a.removeAttribute(e):a.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var i=t.elements[e],a=t.attributes[e]||{},s=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});(0,o.Re)(i)&&(0,r.Z)(i)&&(Object.assign(i.style,s),Object.keys(a).forEach((function(e){i.removeAttribute(e)})))}))}},requires:["computeStyles"]}},6868:(e,t,n)=>{n.d(t,{Z:()=>d});var r=n(415),o=n(471),i=n(1996),a=n(9264),s=n(3168),f=n(982),c=n(6880),p=n(4746),u=n(9399);const d={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,i=e.name,d=e.options,l=n.elements.arrow,m=n.modifiersData.popperOffsets,v=(0,r.Z)(n.placement),h=(0,s.Z)(v),Z=[u.t$,u.F2].indexOf(v)>=0?"height":"width";if(l&&m){var g=function(e,t){return e="function"==typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e,(0,c.Z)("number"!=typeof e?e:(0,p.Z)(e,u.mv))}(d.padding,n),y=(0,o.Z)(l),b="y"===h?u.we:u.t$,w="y"===h?u.I:u.F2,x=n.rects.reference[Z]+n.rects.reference[h]-m[h]-n.rects.popper[Z],O=m[h]-n.rects.reference[h],k=(0,a.Z)(l),j=k?"y"===h?k.clientHeight||0:k.clientWidth||0:0,M=x/2-O/2,P=g[b],E=j-y[Z]-g[w],D=j/2-y[Z]/2+M,R=(0,f.u)(P,D,E),L=h;n.modifiersData[i]=((t={})[L]=R,t.centerOffset=R-D,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&(0,i.Z)(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]}},4656:(e,t,n)=>{n.d(t,{Z:()=>l});var r=n(9399),o=n(9264),i=n(6441),a=n(1277),s=n(3578),f=n(415),c=n(9163),p=n(959),u={top:"auto",right:"auto",bottom:"auto",left:"auto"};function d(e){var t,n=e.popper,f=e.popperRect,c=e.placement,d=e.variation,l=e.offsets,m=e.position,v=e.gpuAcceleration,h=e.adaptive,Z=e.roundOffsets,g=e.isFixed,y=l.x,b=void 0===y?0:y,w=l.y,x=void 0===w?0:w,O="function"==typeof Z?Z({x:b,y:x}):{x:b,y:x};b=O.x,x=O.y;var k=l.hasOwnProperty("x"),j=l.hasOwnProperty("y"),M=r.t$,P=r.we,E=window;if(h){var D=(0,o.Z)(n),R="clientHeight",L="clientWidth";D===(0,i.Z)(n)&&(D=(0,a.Z)(n),"static"!==(0,s.Z)(D).position&&"absolute"===m&&(R="scrollHeight",L="scrollWidth")),(c===r.we||(c===r.t$||c===r.F2)&&d===r.ut)&&(P=r.I,x-=(g&&D===E&&E.visualViewport?E.visualViewport.height:D[R])-f.height,x*=v?1:-1),c!==r.t$&&(c!==r.we&&c!==r.I||d!==r.ut)||(M=r.F2,b-=(g&&D===E&&E.visualViewport?E.visualViewport.width:D[L])-f.width,b*=v?1:-1)}var A,F=Object.assign({position:m},h&&u),B=!0===Z?function(e){var t=e.x,n=e.y,r=window.devicePixelRatio||1;return{x:(0,p.NM)(t*r)/r||0,y:(0,p.NM)(n*r)/r||0}}({x:b,y:x}):{x:b,y:x};return b=B.x,x=B.y,v?Object.assign({},F,((A={})[P]=j?"0":"",A[M]=k?"0":"",A.transform=(E.devicePixelRatio||1)<=1?"translate("+b+"px, "+x+"px)":"translate3d("+b+"px, "+x+"px, 0)",A)):Object.assign({},F,((t={})[P]=j?x+"px":"",t[M]=k?b+"px":"",t.transform="",t))}const l={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,p=void 0===s||s,u={placement:(0,f.Z)(t.placement),variation:(0,c.Z)(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,d(Object.assign({},u,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:p})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,d(Object.assign({},u,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:p})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}}},5128:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(6441),o={passive:!0};const i={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var t=e.state,n=e.instance,i=e.options,a=i.scroll,s=void 0===a||a,f=i.resize,c=void 0===f||f,p=(0,r.Z)(t.elements.popper),u=[].concat(t.scrollParents.reference,t.scrollParents.popper);return s&&u.forEach((function(e){e.addEventListener("scroll",n.update,o)})),c&&p.addEventListener("resize",n.update,o),function(){s&&u.forEach((function(e){e.removeEventListener("scroll",n.update,o)})),c&&p.removeEventListener("resize",n.update,o)}},data:{}}},8570:(e,t,n)=>{n.d(t,{Z:()=>u});var r={left:"right",right:"left",bottom:"top",top:"bottom"};function o(e){return e.replace(/left|right|bottom|top/g,(function(e){return r[e]}))}var i=n(415),a={start:"end",end:"start"};function s(e){return e.replace(/start|end/g,(function(e){return a[e]}))}var f=n(6973),c=n(9163),p=n(9399);const u={name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var a=n.mainAxis,u=void 0===a||a,d=n.altAxis,l=void 0===d||d,m=n.fallbackPlacements,v=n.padding,h=n.boundary,Z=n.rootBoundary,g=n.altBoundary,y=n.flipVariations,b=void 0===y||y,w=n.allowedAutoPlacements,x=t.options.placement,O=(0,i.Z)(x),k=m||(O!==x&&b?function(e){if((0,i.Z)(e)===p.d7)return[];var t=o(e);return[s(e),t,s(t)]}(x):[o(x)]),j=[x].concat(k).reduce((function(e,n){return e.concat((0,i.Z)(n)===p.d7?function(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,a=n.rootBoundary,s=n.padding,u=n.flipVariations,d=n.allowedAutoPlacements,l=void 0===d?p.Ct:d,m=(0,c.Z)(r),v=m?u?p.bw:p.bw.filter((function(e){return(0,c.Z)(e)===m})):p.mv,h=v.filter((function(e){return l.indexOf(e)>=0}));0===h.length&&(h=v);var Z=h.reduce((function(t,n){return t[n]=(0,f.Z)(e,{placement:n,boundary:o,rootBoundary:a,padding:s})[(0,i.Z)(n)],t}),{});return Object.keys(Z).sort((function(e,t){return Z[e]-Z[t]}))}(t,{placement:n,boundary:h,rootBoundary:Z,padding:v,flipVariations:b,allowedAutoPlacements:w}):n)}),[]),M=t.rects.reference,P=t.rects.popper,E=new Map,D=!0,R=j[0],L=0;L<j.length;L++){var A=j[L],F=(0,i.Z)(A),B=(0,c.Z)(A)===p.BL,V=[p.we,p.I].indexOf(F)>=0,W=V?"width":"height",H=(0,f.Z)(t,{placement:A,boundary:h,rootBoundary:Z,altBoundary:g,padding:v}),I=V?B?p.F2:p.t$:B?p.I:p.we;M[W]>P[W]&&(I=o(I));var C=o(I),q=[];if(u&&q.push(H[F]<=0),l&&q.push(H[I]<=0,H[C]<=0),q.every((function(e){return e}))){R=A,D=!1;break}E.set(A,q)}if(D)for(var N=function(e){var t=j.find((function(t){var n=E.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return R=t,"break"},S=b?3:1;S>0&&"break"!==N(S);S--);t.placement!==R&&(t.modifiersData[r]._skip=!0,t.placement=R,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}}},6545:(e,t,n)=>{n.d(t,{Z:()=>s});var r=n(9399),o=n(6973);function i(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function a(e){return[r.we,r.F2,r.I,r.t$].some((function(t){return e[t]>=0}))}const s={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,s=t.rects.popper,f=t.modifiersData.preventOverflow,c=(0,o.Z)(t,{elementContext:"reference"}),p=(0,o.Z)(t,{altBoundary:!0}),u=i(c,r),d=i(p,s,f),l=a(u),m=a(d);t.modifiersData[n]={referenceClippingOffsets:u,popperEscapeOffsets:d,isReferenceHidden:l,hasPopperEscaped:m},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":l,"data-popper-escaped":m})}}},4507:(e,t,n)=>{n.d(t,{Z:()=>i});var r=n(415),o=n(9399);const i={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,i=e.name,a=n.offset,s=void 0===a?[0,0]:a,f=o.Ct.reduce((function(e,n){return e[n]=function(e,t,n){var i=(0,r.Z)(e),a=[o.t$,o.we].indexOf(i)>=0?-1:1,s="function"==typeof n?n(Object.assign({},t,{placement:e})):n,f=s[0],c=s[1];return f=f||0,c=(c||0)*a,[o.t$,o.F2].indexOf(i)>=0?{x:c,y:f}:{x:f,y:c}}(n,t.rects,s),e}),{}),c=f[t.placement],p=c.x,u=c.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=p,t.modifiersData.popperOffsets.y+=u),t.modifiersData[i]=f}}},8061:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(1279);const o={name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=(0,r.Z)({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}}},9405:(e,t,n)=>{n.d(t,{Z:()=>l});var r=n(9399),o=n(415),i=n(3168),a=n(982),s=n(471),f=n(9264),c=n(6973),p=n(9163),u=n(3083),d=n(959);const l={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,l=e.name,m=n.mainAxis,v=void 0===m||m,h=n.altAxis,Z=void 0!==h&&h,g=n.boundary,y=n.rootBoundary,b=n.altBoundary,w=n.padding,x=n.tether,O=void 0===x||x,k=n.tetherOffset,j=void 0===k?0:k,M=(0,c.Z)(t,{boundary:g,rootBoundary:y,padding:w,altBoundary:b}),P=(0,o.Z)(t.placement),E=(0,p.Z)(t.placement),D=!E,R=(0,i.Z)(P),L="x"===R?"y":"x",A=t.modifiersData.popperOffsets,F=t.rects.reference,B=t.rects.popper,V="function"==typeof j?j(Object.assign({},t.rects,{placement:t.placement})):j,W="number"==typeof V?{mainAxis:V,altAxis:V}:Object.assign({mainAxis:0,altAxis:0},V),H=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,I={x:0,y:0};if(A){if(v){var C,q="y"===R?r.we:r.t$,N="y"===R?r.I:r.F2,S="y"===R?"height":"width",$=A[R],T=$+M[q],K=$-M[N],z=O?-B[S]/2:0,X=E===r.BL?F[S]:B[S],Y=E===r.BL?-B[S]:-F[S],U=t.elements.arrow,_=O&&U?(0,s.Z)(U):{width:0,height:0},G=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:(0,u.Z)(),J=G[q],Q=G[N],ee=(0,a.u)(0,F[S],_[S]),te=D?F[S]/2-z-ee-J-W.mainAxis:X-ee-J-W.mainAxis,ne=D?-F[S]/2+z+ee+Q+W.mainAxis:Y+ee+Q+W.mainAxis,re=t.elements.arrow&&(0,f.Z)(t.elements.arrow),oe=re?"y"===R?re.clientTop||0:re.clientLeft||0:0,ie=null!=(C=null==H?void 0:H[R])?C:0,ae=$+te-ie-oe,se=$+ne-ie,fe=(0,a.u)(O?(0,d.VV)(T,ae):T,$,O?(0,d.Fp)(K,se):K);A[R]=fe,I[R]=fe-$}if(Z){var ce,pe="x"===R?r.we:r.t$,ue="x"===R?r.I:r.F2,de=A[L],le="y"===L?"height":"width",me=de+M[pe],ve=de-M[ue],he=-1!==[r.we,r.t$].indexOf(P),Ze=null!=(ce=null==H?void 0:H[L])?ce:0,ge=he?me:de-F[le]-B[le]-Ze+W.altAxis,ye=he?de+F[le]+B[le]-Ze-W.altAxis:ve,be=O&&he?(0,a.q)(ge,de,ye):(0,a.u)(O?ge:me,de,O?ye:ve);A[L]=be,I[L]=be-de}t.modifiersData[l]=I}},requiresIfExists:["offset"]}},1511:(e,t,n)=>{n.d(t,{fi:()=>m});var r=n(3832),o=n(5128),i=n(8061),a=n(4656),s=n(6887),f=n(4507),c=n(8570),p=n(9405),u=n(6868),d=n(6545),l=[o.Z,i.Z,a.Z,s.Z,f.Z,c.Z,p.Z,u.Z,d.Z],m=(0,r.kZ)({defaultModifiers:l})},1279:(e,t,n)=>{n.d(t,{Z:()=>s});var r=n(415),o=n(9163),i=n(3168),a=n(9399);function s(e){var t,n=e.reference,s=e.element,f=e.placement,c=f?(0,r.Z)(f):null,p=f?(0,o.Z)(f):null,u=n.x+n.width/2-s.width/2,d=n.y+n.height/2-s.height/2;switch(c){case a.we:t={x:u,y:n.y-s.height};break;case a.I:t={x:u,y:n.y+n.height};break;case a.F2:t={x:n.x+n.width,y:d};break;case a.t$:t={x:n.x-s.width,y:d};break;default:t={x:n.x,y:n.y}}var l=c?(0,i.Z)(c):null;if(null!=l){var m="y"===l?"height":"width";switch(p){case a.BL:t[l]=t[l]-(n[m]/2-s[m]/2);break;case a.ut:t[l]=t[l]+(n[m]/2-s[m]/2)}}return t}},6973:(e,t,n)=>{n.d(t,{Z:()=>x});var r=n(9399),o=n(6441),i=n(1277),a=n(1085),s=n(3578),f=n(1004),c=n(959),p=n(7636),u=n(9264),d=n(7002),l=n(8934),m=n(8021),v=n(1996),h=n(7123);function Z(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function g(e,t){return t===r.Pj?Z(function(e){var t=(0,o.Z)(e),n=(0,i.Z)(e),r=t.visualViewport,s=n.clientWidth,f=n.clientHeight,c=0,p=0;return r&&(s=r.width,f=r.height,/^((?!chrome|android).)*safari/i.test(navigator.userAgent)||(c=r.offsetLeft,p=r.offsetTop)),{width:s,height:f,x:c+(0,a.Z)(e),y:p}}(e)):(0,d.kK)(t)?function(e){var t=(0,l.Z)(e);return t.top=t.top+e.clientTop,t.left=t.left+e.clientLeft,t.bottom=t.top+e.clientHeight,t.right=t.left+e.clientWidth,t.width=e.clientWidth,t.height=e.clientHeight,t.x=t.left,t.y=t.top,t}(t):Z(function(e){var t,n=(0,i.Z)(e),r=(0,f.Z)(e),o=null==(t=e.ownerDocument)?void 0:t.body,p=(0,c.Fp)(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),u=(0,c.Fp)(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),d=-r.scrollLeft+(0,a.Z)(e),l=-r.scrollTop;return"rtl"===(0,s.Z)(o||n).direction&&(d+=(0,c.Fp)(n.clientWidth,o?o.clientWidth:0)-p),{width:p,height:u,x:d,y:l}}((0,i.Z)(e)))}var y=n(1279),b=n(6880),w=n(4746);function x(e,t){void 0===t&&(t={});var n=t,o=n.placement,a=void 0===o?e.placement:o,f=n.boundary,x=void 0===f?r.zV:f,O=n.rootBoundary,k=void 0===O?r.Pj:O,j=n.elementContext,M=void 0===j?r.k5:j,P=n.altBoundary,E=void 0!==P&&P,D=n.padding,R=void 0===D?0:D,L=(0,b.Z)("number"!=typeof R?R:(0,w.Z)(R,r.mv)),A=M===r.k5?r.YP:r.k5,F=e.rects.popper,B=e.elements[E?A:M],V=function(e,t,n){var r="clippingParents"===t?function(e){var t=(0,p.Z)((0,m.Z)(e)),n=["absolute","fixed"].indexOf((0,s.Z)(e).position)>=0&&(0,d.Re)(e)?(0,u.Z)(e):e;return(0,d.kK)(n)?t.filter((function(e){return(0,d.kK)(e)&&(0,v.Z)(e,n)&&"body"!==(0,h.Z)(e)})):[]}(e):[].concat(t),o=[].concat(r,[n]),i=o[0],a=o.reduce((function(t,n){var r=g(e,n);return t.top=(0,c.Fp)(r.top,t.top),t.right=(0,c.VV)(r.right,t.right),t.bottom=(0,c.VV)(r.bottom,t.bottom),t.left=(0,c.Fp)(r.left,t.left),t}),g(e,i));return a.width=a.right-a.left,a.height=a.bottom-a.top,a.x=a.left,a.y=a.top,a}((0,d.kK)(B)?B:B.contextElement||(0,i.Z)(e.elements.popper),x,k),W=(0,l.Z)(e.elements.reference),H=(0,y.Z)({reference:W,element:F,strategy:"absolute",placement:a}),I=Z(Object.assign({},F,H)),C=M===r.k5?I:W,q={top:V.top-C.top+L.top,bottom:C.bottom-V.bottom+L.bottom,left:V.left-C.left+L.left,right:C.right-V.right+L.right},N=e.modifiersData.offset;if(M===r.k5&&N){var S=N[a];Object.keys(q).forEach((function(e){var t=[r.F2,r.I].indexOf(e)>=0?1:-1,n=[r.we,r.I].indexOf(e)>=0?"y":"x";q[e]+=S[n]*t}))}return q}},4746:(e,t,n)=>{function r(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}n.d(t,{Z:()=>r})},415:(e,t,n)=>{function r(e){return e.split("-")[0]}n.d(t,{Z:()=>r})},3083:(e,t,n)=>{function r(){return{top:0,right:0,bottom:0,left:0}}n.d(t,{Z:()=>r})},3168:(e,t,n)=>{function r(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}n.d(t,{Z:()=>r})},9163:(e,t,n)=>{function r(e){return e.split("-")[1]}n.d(t,{Z:()=>r})},959:(e,t,n)=>{n.d(t,{Fp:()=>r,NM:()=>i,VV:()=>o});var r=Math.max,o=Math.min,i=Math.round},6880:(e,t,n)=>{n.d(t,{Z:()=>o});var r=n(3083);function o(e){return Object.assign({},(0,r.Z)(),e)}},982:(e,t,n)=>{n.d(t,{q:()=>i,u:()=>o});var r=n(959);function o(e,t,n){return(0,r.Fp)(e,(0,r.VV)(t,n))}function i(e,t,n){var r=o(e,t,n);return r>n?n:r}}}]);