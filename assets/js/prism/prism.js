/* PrismJS 1.19.0
https://prismjs.com/download.html#themes=prism-okaidia&languages=clike+javascript+csharp&plugins=line-highlight+line-numbers+autolinker+file-highlight+autoloader */
var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(u){var c=/\blang(?:uage)?-([\w-]+)\b/i,r=0,C={manual:u.Prism&&u.Prism.manual,disableWorkerMessageHandler:u.Prism&&u.Prism.disableWorkerMessageHandler,util:{encode:function e(r){return r instanceof _?new _(r.type,e(r.content),r.alias):Array.isArray(r)?r.map(e):r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++r}),e.__id},clone:function n(e,t){var a,r,i=C.util.type(e);switch(t=t||{},i){case"Object":if(r=C.util.objId(e),t[r])return t[r];for(var o in a={},t[r]=a,e)e.hasOwnProperty(o)&&(a[o]=n(e[o],t));return a;case"Array":return r=C.util.objId(e),t[r]?t[r]:(a=[],t[r]=a,e.forEach(function(e,r){a[r]=n(e,t)}),a);default:return e}},getLanguage:function(e){for(;e&&!c.test(e.className);)e=e.parentElement;return e?(e.className.match(c)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(e){var r=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack)||[])[1];if(r){var n=document.getElementsByTagName("script");for(var t in n)if(n[t].src==r)return n[t]}return null}}},languages:{extend:function(e,r){var n=C.util.clone(C.languages[e]);for(var t in r)n[t]=r[t];return n},insertBefore:function(n,e,r,t){var a=(t=t||C.languages)[n],i={};for(var o in a)if(a.hasOwnProperty(o)){if(o==e)for(var l in r)r.hasOwnProperty(l)&&(i[l]=r[l]);r.hasOwnProperty(o)||(i[o]=a[o])}var s=t[n];return t[n]=i,C.languages.DFS(C.languages,function(e,r){r===s&&e!=n&&(this[e]=i)}),i},DFS:function e(r,n,t,a){a=a||{};var i=C.util.objId;for(var o in r)if(r.hasOwnProperty(o)){n.call(r,o,r[o],t||o);var l=r[o],s=C.util.type(l);"Object"!==s||a[i(l)]?"Array"!==s||a[i(l)]||(a[i(l)]=!0,e(l,n,o,a)):(a[i(l)]=!0,e(l,n,null,a))}}},plugins:{},highlightAll:function(e,r){C.highlightAllUnder(document,e,r)},highlightAllUnder:function(e,r,n){var t={callback:n,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};C.hooks.run("before-highlightall",t),t.elements=Array.prototype.slice.apply(t.container.querySelectorAll(t.selector)),C.hooks.run("before-all-elements-highlight",t);for(var a,i=0;a=t.elements[i++];)C.highlightElement(a,!0===r,t.callback)},highlightElement:function(e,r,n){var t=C.util.getLanguage(e),a=C.languages[t];e.className=e.className.replace(c,"").replace(/\s+/g," ")+" language-"+t;var i=e.parentNode;i&&"pre"===i.nodeName.toLowerCase()&&(i.className=i.className.replace(c,"").replace(/\s+/g," ")+" language-"+t);var o={element:e,language:t,grammar:a,code:e.textContent};function l(e){o.highlightedCode=e,C.hooks.run("before-insert",o),o.element.innerHTML=o.highlightedCode,C.hooks.run("after-highlight",o),C.hooks.run("complete",o),n&&n.call(o.element)}if(C.hooks.run("before-sanity-check",o),!o.code)return C.hooks.run("complete",o),void(n&&n.call(o.element));if(C.hooks.run("before-highlight",o),o.grammar)if(r&&u.Worker){var s=new Worker(C.filename);s.onmessage=function(e){l(e.data)},s.postMessage(JSON.stringify({language:o.language,code:o.code,immediateClose:!0}))}else l(C.highlight(o.code,o.grammar,o.language));else l(C.util.encode(o.code))},highlight:function(e,r,n){var t={code:e,grammar:r,language:n};return C.hooks.run("before-tokenize",t),t.tokens=C.tokenize(t.code,t.grammar),C.hooks.run("after-tokenize",t),_.stringify(C.util.encode(t.tokens),t.language)},matchGrammar:function(e,r,n,t,a,i,o){for(var l in n)if(n.hasOwnProperty(l)&&n[l]){var s=n[l];s=Array.isArray(s)?s:[s];for(var u=0;u<s.length;++u){if(o&&o==l+","+u)return;var c=s[u],g=c.inside,f=!!c.lookbehind,h=!!c.greedy,d=0,m=c.alias;if(h&&!c.pattern.global){var p=c.pattern.toString().match(/[imsuy]*$/)[0];c.pattern=RegExp(c.pattern.source,p+"g")}c=c.pattern||c;for(var y=t,v=a;y<r.length;v+=r[y].length,++y){var k=r[y];if(r.length>e.length)return;if(!(k instanceof _)){if(h&&y!=r.length-1){if(c.lastIndex=v,!(S=c.exec(e)))break;for(var b=S.index+(f&&S[1]?S[1].length:0),w=S.index+S[0].length,A=y,P=v,x=r.length;A<x&&(P<w||!r[A].type&&!r[A-1].greedy);++A)(P+=r[A].length)<=b&&(++y,v=P);if(r[y]instanceof _)continue;O=A-y,k=e.slice(v,P),S.index-=v}else{c.lastIndex=0;var S=c.exec(k),O=1}if(S){f&&(d=S[1]?S[1].length:0);w=(b=S.index+d)+(S=S[0].slice(d)).length;var E=k.slice(0,b),N=k.slice(w),j=[y,O];E&&(++y,v+=E.length,j.push(E));var L=new _(l,g?C.tokenize(S,g):S,m,S,h);if(j.push(L),N&&j.push(N),Array.prototype.splice.apply(r,j),1!=O&&C.matchGrammar(e,r,n,y,v,!0,l+","+u),i)break}else if(i)break}}}}},tokenize:function(e,r){var n=[e],t=r.rest;if(t){for(var a in t)r[a]=t[a];delete r.rest}return C.matchGrammar(e,n,r,0,0,!1),n},hooks:{all:{},add:function(e,r){var n=C.hooks.all;n[e]=n[e]||[],n[e].push(r)},run:function(e,r){var n=C.hooks.all[e];if(n&&n.length)for(var t,a=0;t=n[a++];)t(r)}},Token:_};function _(e,r,n,t,a){this.type=e,this.content=r,this.alias=n,this.length=0|(t||"").length,this.greedy=!!a}if(u.Prism=C,_.stringify=function r(e,n){if("string"==typeof e)return e;if(Array.isArray(e)){var t="";return e.forEach(function(e){t+=r(e,n)}),t}var a={type:e.type,content:r(e.content,n),tag:"span",classes:["token",e.type],attributes:{},language:n},i=e.alias;i&&(Array.isArray(i)?Array.prototype.push.apply(a.classes,i):a.classes.push(i)),C.hooks.run("wrap",a);var o="";for(var l in a.attributes)o+=" "+l+'="'+(a.attributes[l]||"").replace(/"/g,"&quot;")+'"';return"<"+a.tag+' class="'+a.classes.join(" ")+'"'+o+">"+a.content+"</"+a.tag+">"},!u.document)return u.addEventListener&&(C.disableWorkerMessageHandler||u.addEventListener("message",function(e){var r=JSON.parse(e.data),n=r.language,t=r.code,a=r.immediateClose;u.postMessage(C.highlight(t,C.languages[n],n)),a&&u.close()},!1)),C;var e=C.util.currentScript();function n(){C.manual||C.highlightAll()}if(e&&(C.filename=e.src,e.hasAttribute("data-manual")&&(C.manual=!0)),!C.manual){var t=document.readyState;"loading"===t||"interactive"===t&&e&&e.defer?document.addEventListener("DOMContentLoaded",n):window.requestAnimationFrame?window.requestAnimationFrame(n):window.setTimeout(n,16)}return C}(_self);"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,boolean:/\b(?:true|false)\b/,function:/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,punctuation:/[{}[\];(),.:]/};
Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,lookbehind:!0}],keyword:[{pattern:/((?:^|})\s*)(?:catch|finally)\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],number:/\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,function:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,operator:/--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/}),Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/,Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,lookbehind:!0,greedy:!0},"function-variable":{pattern:/#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/}),Prism.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\${|}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.js=Prism.languages.javascript;
Prism.languages.csharp=Prism.languages.extend("clike",{keyword:/\b(?:abstract|add|alias|as|ascending|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|descending|do|double|dynamic|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|from|get|global|goto|group|if|implicit|in|int|interface|internal|into|is|join|let|lock|long|namespace|new|null|object|operator|orderby|out|override|params|partial|private|protected|public|readonly|ref|remove|return|sbyte|sealed|select|set|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|value|var|virtual|void|volatile|where|while|yield)\b/,string:[{pattern:/@("|')(?:\1\1|\\[\s\S]|(?!\1)[^\\])*\1/,greedy:!0},{pattern:/("|')(?:\\.|(?!\1)[^\\\r\n])*?\1/,greedy:!0}],"class-name":[{pattern:/\b[A-Z]\w*(?:\.\w+)*\b(?=\s+\w+)/,inside:{punctuation:/\./}},{pattern:/(\[)[A-Z]\w*(?:\.\w+)*\b/,lookbehind:!0,inside:{punctuation:/\./}},{pattern:/(\b(?:class|interface)\s+[A-Z]\w*(?:\.\w+)*\s*:\s*)[A-Z]\w*(?:\.\w+)*\b/,lookbehind:!0,inside:{punctuation:/\./}},{pattern:/((?:\b(?:class|interface|new)\s+)|(?:catch\s+\())[A-Z]\w*(?:\.\w+)*\b/,lookbehind:!0,inside:{punctuation:/\./}}],number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)f?/i,operator:/>>=?|<<=?|[-=]>|([-+&|?])\1|~|[-+*/%&|^!=<>]=?/,punctuation:/\?\.?|::|[{}[\];(),.:]/}),Prism.languages.insertBefore("csharp","class-name",{"generic-method":{pattern:/\w+\s*<[^>\r\n]+?>\s*(?=\()/,inside:{function:/^\w+/,"class-name":{pattern:/\b[A-Z]\w*(?:\.\w+)*\b/,inside:{punctuation:/\./}},keyword:Prism.languages.csharp.keyword,punctuation:/[<>(),.:]/}},preprocessor:{pattern:/(^\s*)#.*/m,lookbehind:!0,alias:"property",inside:{directive:{pattern:/(\s*#)\b(?:define|elif|else|endif|endregion|error|if|line|pragma|region|undef|warning)\b/,lookbehind:!0,alias:"keyword"}}}}),Prism.languages.dotnet=Prism.languages.cs=Prism.languages.csharp;
!function(){if("undefined"!=typeof self&&self.Prism&&self.document&&document.querySelector){var t,n=function(){if(void 0===t){var e=document.createElement("div");e.style.fontSize="13px",e.style.lineHeight="1.5",e.style.padding=0,e.style.border=0,e.innerHTML="&nbsp;<br />&nbsp;",document.body.appendChild(e),t=38===e.offsetHeight,document.body.removeChild(e)}return t},a=0;Prism.hooks.add("before-sanity-check",function(e){var t=e.element.parentNode,n=t&&t.getAttribute("data-line");if(t&&n&&/pre/i.test(t.nodeName)){var i=0;r(".line-highlight",t).forEach(function(e){i+=e.textContent.length,e.parentNode.removeChild(e)}),i&&/^( \n)+$/.test(e.code.slice(-i))&&(e.code=e.code.slice(0,-i))}}),Prism.hooks.add("complete",function e(t){var n=t.element.parentNode,i=n&&n.getAttribute("data-line");if(n&&i&&/pre/i.test(n.nodeName)){clearTimeout(a);var r=Prism.plugins.lineNumbers,o=t.plugins&&t.plugins.lineNumbers;if(l(n,"line-numbers")&&r&&!o)Prism.hooks.add("line-numbers",e);else s(n,i)(),a=setTimeout(u,1)}}),window.addEventListener("hashchange",u),window.addEventListener("resize",function(){var t=[];r("pre[data-line]").forEach(function(e){t.push(s(e))}),t.forEach(i)})}function r(e,t){return Array.prototype.slice.call((t||document).querySelectorAll(e))}function l(e,t){return t=" "+t+" ",-1<(" "+e.className+" ").replace(/[\n\t]/g," ").indexOf(t)}function i(e){e()}function s(u,e,d){var t=(e="string"==typeof e?e:u.getAttribute("data-line")).replace(/\s+/g,"").split(","),c=+u.getAttribute("data-line-offset")||0,f=(n()?parseInt:parseFloat)(getComputedStyle(u).lineHeight),h=l(u,"line-numbers"),p=h?u:u.querySelector("code")||u,m=[];return t.forEach(function(e){var t=e.split("-"),n=+t[0],i=+t[1]||n,r=u.querySelector('.line-highlight[data-range="'+e+'"]')||document.createElement("div");if(m.push(function(){r.setAttribute("aria-hidden","true"),r.setAttribute("data-range",e),r.className=(d||"")+" line-highlight"}),h&&Prism.plugins.lineNumbers){var o=Prism.plugins.lineNumbers.getLine(u,n),a=Prism.plugins.lineNumbers.getLine(u,i);if(o){var l=o.offsetTop+"px";m.push(function(){r.style.top=l})}if(a){var s=a.offsetTop-o.offsetTop+a.offsetHeight+"px";m.push(function(){r.style.height=s})}}else m.push(function(){r.setAttribute("data-start",n),n<i&&r.setAttribute("data-end",i),r.style.top=(n-c-1)*f+"px",r.textContent=new Array(i-n+2).join(" \n")});m.push(function(){p.appendChild(r)})}),function(){m.forEach(i)}}function u(){var e=location.hash.slice(1);r(".temporary.line-highlight").forEach(function(e){e.parentNode.removeChild(e)});var t=(e.match(/\.([\d,-]+)$/)||[,""])[1];if(t&&!document.getElementById(e)){var n=e.slice(0,e.lastIndexOf(".")),i=document.getElementById(n);if(i)i.hasAttribute("data-line")||i.setAttribute("data-line",""),s(i,t,"temporary ")(),document.querySelector(".temporary.line-highlight").scrollIntoView()}}}();
!function(){if("undefined"!=typeof self&&self.Prism&&self.document){var l="line-numbers",c=/\n(?!$)/g,m=function(e){var t=a(e)["white-space"];if("pre-wrap"===t||"pre-line"===t){var n=e.querySelector("code"),r=e.querySelector(".line-numbers-rows"),s=e.querySelector(".line-numbers-sizer"),i=n.textContent.split(c);s||((s=document.createElement("span")).className="line-numbers-sizer",n.appendChild(s)),s.style.display="block",i.forEach(function(e,t){s.textContent=e||"\n";var n=s.getBoundingClientRect().height;r.children[t].style.height=n+"px"}),s.textContent="",s.style.display="none"}},a=function(e){return e?window.getComputedStyle?getComputedStyle(e):e.currentStyle||null:null};window.addEventListener("resize",function(){Array.prototype.forEach.call(document.querySelectorAll("pre."+l),m)}),Prism.hooks.add("complete",function(e){if(e.code){var t=e.element,n=t.parentNode;if(n&&/pre/i.test(n.nodeName)&&!t.querySelector(".line-numbers-rows")){for(var r=!1,s=/(?:^|\s)line-numbers(?:\s|$)/,i=t;i;i=i.parentNode)if(s.test(i.className)){r=!0;break}if(r){t.className=t.className.replace(s," "),s.test(n.className)||(n.className+=" line-numbers");var l,a=e.code.match(c),o=a?a.length+1:1,u=new Array(o+1).join("<span></span>");(l=document.createElement("span")).setAttribute("aria-hidden","true"),l.className="line-numbers-rows",l.innerHTML=u,n.hasAttribute("data-start")&&(n.style.counterReset="linenumber "+(parseInt(n.getAttribute("data-start"),10)-1)),e.element.appendChild(l),m(n),Prism.hooks.run("line-numbers",e)}}}}),Prism.hooks.add("line-numbers",function(e){e.plugins=e.plugins||{},e.plugins.lineNumbers=!0}),Prism.plugins.lineNumbers={getLine:function(e,t){if("PRE"===e.tagName&&e.classList.contains(l)){var n=e.querySelector(".line-numbers-rows"),r=parseInt(e.getAttribute("data-start"),10)||1,s=r+(n.children.length-1);t<r&&(t=r),s<t&&(t=s);var i=t-r;return n.children[i]}}}}}();
!function(){if(("undefined"==typeof self||self.Prism)&&("undefined"==typeof global||global.Prism)){var t=/\b([a-z]{3,7}:\/\/|tel:)[\w\-+%~/.:=&@]+(?:\?[\w\-+%~/.:=?&!$'()*,;@]*)?(?:#[\w\-+%~/.:#=?&!$'()*,;@]*)?/,r=/\b\S+@[\w.]+[a-z]{2}/,a=/\[([^\]]+)]\(([^)]+)\)/,l=["comment","url","attr-value","string"];Prism.plugins.autolinker={processGrammar:function(i){i&&!i["url-link"]&&(Prism.languages.DFS(i,function(i,n,e){-1<l.indexOf(e)&&!Array.isArray(n)&&(n.pattern||(n=this[i]={pattern:n}),n.inside=n.inside||{},"comment"==e&&(n.inside["md-link"]=a),"attr-value"==e?Prism.languages.insertBefore("inside","punctuation",{"url-link":t},n):n.inside["url-link"]=t,n.inside["email-link"]=r)}),i["url-link"]=t,i["email-link"]=r)}},Prism.hooks.add("before-highlight",function(i){Prism.plugins.autolinker.processGrammar(i.grammar)}),Prism.hooks.add("wrap",function(i){if(/-link$/.test(i.type)){i.tag="a";var n=i.content;if("email-link"==i.type&&0!=n.indexOf("mailto:"))n="mailto:"+n;else if("md-link"==i.type){var e=i.content.match(a);n=e[2],i.content=e[1]}i.attributes.href=n;try{i.content=decodeURIComponent(i.content)}catch(i){}}})}}();
"undefined"!=typeof self&&self.Prism&&self.document&&document.querySelector&&(self.Prism.fileHighlight=function(e){e=e||document;var i={js:"javascript",py:"python",rb:"ruby",ps1:"powershell",psm1:"powershell",sh:"bash",bat:"batch",h:"c",tex:"latex"};Array.prototype.slice.call(e.querySelectorAll("pre[data-src]")).forEach(function(e){if(!e.hasAttribute("data-src-loaded")){for(var t,a=e.getAttribute("data-src"),s=e,n=/\blang(?:uage)?-([\w-]+)\b/i;s&&!n.test(s.className);)s=s.parentNode;if(s&&(t=(e.className.match(n)||[,""])[1]),!t){var r=(a.match(/\.(\w+)$/)||[,""])[1];t=i[r]||r}var o=document.createElement("code");o.className="language-"+t,e.textContent="",o.textContent="Loading…",e.appendChild(o);var l=new XMLHttpRequest;l.open("GET",a,!0),l.onreadystatechange=function(){4==l.readyState&&(l.status<400&&l.responseText?(o.textContent=l.responseText,Prism.highlightElement(o),e.setAttribute("data-src-loaded","")):400<=l.status?o.textContent="✖ Error "+l.status+" while fetching file: "+l.statusText:o.textContent="✖ Error: File does not exist or is empty")},l.send(null)}})},document.addEventListener("DOMContentLoaded",function(){self.Prism.fileHighlight()}));
!function(){if("undefined"!=typeof self&&self.Prism&&self.document&&document.createElement){var l={javascript:"clike",actionscript:"javascript",arduino:"cpp",aspnet:["markup","csharp"],bison:"c",c:"clike",csharp:"clike",cpp:"c",coffeescript:"javascript",crystal:"ruby","css-extras":"css",d:"clike",dart:"clike",django:"markup-templating",ejs:["javascript","markup-templating"],etlua:["lua","markup-templating"],erb:["ruby","markup-templating"],fsharp:"clike","firestore-security-rules":"clike",flow:"javascript",ftl:"markup-templating",glsl:"clike",gml:"clike",go:"clike",groovy:"clike",haml:"ruby",handlebars:"markup-templating",haxe:"clike",java:"clike",javadoc:["markup","java","javadoclike"],jolie:"clike",jsdoc:["javascript","javadoclike"],"js-extras":"javascript","js-templates":"javascript",jsonp:"json",json5:"json",kotlin:"clike",latte:["clike","markup-templating","php"],less:"css",lilypond:"scheme",markdown:"markup","markup-templating":"markup",n4js:"javascript",nginx:"clike",objectivec:"c",opencl:"c",parser:"markup",php:["clike","markup-templating"],phpdoc:["php","javadoclike"],"php-extras":"php",plsql:"sql",processing:"clike",protobuf:"clike",pug:["markup","javascript"],qml:"javascript",qore:"clike",jsx:["markup","javascript"],tsx:["jsx","typescript"],reason:"clike",ruby:"clike",sass:"css",scss:"css",scala:"java","shell-session":"bash",smarty:"markup-templating",solidity:"clike",soy:"markup-templating",sparql:"turtle",sqf:"clike",swift:"clike",tap:"yaml",textile:"markup",tt2:["clike","markup-templating"],twig:"markup",typescript:"javascript","t4-cs":["t4-templating","csharp"],"t4-vb":["t4-templating","visual-basic"],vala:"clike",vbnet:"basic",velocity:"markup",wiki:"markup",xeora:"markup",xquery:"markup"},c={html:"markup",xml:"markup",svg:"markup",mathml:"markup",js:"javascript",g4:"antlr4",adoc:"asciidoc",shell:"bash",rbnf:"bnf",conc:"concurnas",cs:"csharp",dotnet:"csharp",coffee:"coffeescript",jinja2:"django","dns-zone":"dns-zone-file",dockerfile:"docker",xlsx:"excel-formula",xls:"excel-formula",gamemakerlanguage:"gml",hs:"haskell",tex:"latex",context:"latex",ly:"lilypond",emacs:"lisp",elisp:"lisp","emacs-lisp":"lisp",md:"markdown",moon:"moonscript",n4jsd:"n4js",objectpascal:"pascal",px:"pcaxis",pq:"powerquery",mscript:"powerquery",py:"python",robot:"robotframework",rb:"ruby",sln:"solution-file",rq:"sparql",trig:"turtle",ts:"typescript",t4:"t4-cs",vb:"visual-basic",xeoracube:"xeora",yml:"yaml"},n={},e="components/",a=Prism.util.currentScript();if(a){var t=/\bplugins\/autoloader\/prism-autoloader\.(?:min\.)js$/i,r=/[\w-]+\.(?:min\.)js$/i;if(a.hasAttribute("data-autoloader-path"))e=a.getAttribute("data-autoloader-path").trim().replace(/\/?$/,"/");else{var s=a.src;t.test(s)?e=s.replace(t,"components/"):r.test(s)&&(e=s.replace(r,"components/"))}}var p=Prism.plugins.autoloader={languages_path:e,use_minified:!0,loadLanguages:o};Prism.hooks.add("complete",function(e){e.element&&e.language&&!e.grammar&&"none"!==e.language&&function(e,a){e in c&&(e=c[e]);var t=a.getAttribute("data-dependencies"),r=a.parentElement;!t&&r&&"pre"===r.tagName.toLowerCase()&&(t=r.getAttribute("data-dependencies")),o(t=t?t.split(/\s*,\s*/g):[],function(){u(e,function(){Prism.highlightElement(a)})})}(e.language,e.element)})}function o(e,a,t){"string"==typeof e&&(e=[e]);var r=e.length,s=0,i=!1;function l(){i||++s===r&&a&&a(e)}0!==r?e.forEach(function(e){u(e,l,function(){i||(i=!0,t&&t(e))})}):a&&setTimeout(a,0)}function u(a,t,r){var s=0<=a.indexOf("!");a=a.replace("!",""),a=c[a]||a;var e=function(){var e=n[a];if(e||(e=n[a]={callbacks:[]}),e.callbacks.push({success:t,error:r}),!s&&Prism.languages[a])m(a,"success");else if(!s&&e.error)m(a,"error");else if(s||!e.loading){e.loading=!0,function(e,a,t){var r=document.createElement("script");r.src=e,r.async=!0,r.onload=function(){document.body.removeChild(r),a&&a()},r.onerror=function(){document.body.removeChild(r),t&&t()},document.body.appendChild(r)}(function(e){return p.languages_path+"prism-"+e+(p.use_minified?".min":"")+".js"}(a),function(){e.loading=!1,m(a,"success")},function(){e.loading=!1,e.error=!0,m(a,"error")})}},i=l[a];i&&i.length?o(i,e,r):e()}function m(e,a){if(n[e]){for(var t=n[e].callbacks,r=0,s=t.length;r<s;r++){var i=t[r][a];i&&setTimeout(i,0)}t.length=0}}}();
