!function(t){var e={};function s(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=e,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)s.d(i,n,function(e){return t[e]}.bind(null,n));return i},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=1)}([function(t,e,s){},function(t,e,s){"use strict";s.r(e);s(0);const i=["rgb(55, 126, 184)","rgb(102, 166, 30)","rgb(152, 78, 163)","rgb(0, 210, 213)","rgb(255, 127, 0)","rgb(175, 141, 0)","rgb(127, 128, 205)","rgb(179, 233, 0)","rgb(196, 46, 96)","rgb(166, 86, 40)"];let n=0;const o="http://www.w3.org/2000/svg",r=25,h=80,d=100;class l{constructor(t){this.char=t,this.nextNodesByChar=new Map,this.suffixLink=null,this.endSuffixLinks=[],this.wordEndings=[]}addNextNode(t,e=!1){this.nextNodesByChar.set(t.char,t)}getNextNodeByChar(t){return this.nextNodesByChar.get(t)}addEndOfWord(t){this.wordEndings.push(t)}calcLayout(){let t=0,e=0;return this.childWidths=[],this.nextNodesByChar.forEach(s=>{let i=s.calcLayout();this.childWidths.push(i.width),t+=i.width,e=Math.max(e,i.height)}),e&&(e+=h/2),this.leftOffset=(Math.max(d,t)-d)/2,{height:e+h,width:Math.max(d,t)}}calcPosition({left:t,top:e}={left:0,top:0}){this.posX=t+this.leftOffset+d/2,this.posY=e+h/2;let s=0,i=t;this.nextNodesByChar.forEach(t=>{t.calcPosition({left:i,top:this.posY+h}),i+=this.childWidths[s],s++})}renderTo(t){let e=document.createElementNS(o,"circle");e.setAttribute("cx",this.posX),e.setAttribute("cy",this.posY),e.setAttribute("r",r),e.setAttribute("style",`fill: ${0===this.wordEndings.length?"white":"lightgrey"}; stroke: blue; stroke-width: 3px;`);let s=document.createElementNS(o,"text");if(s.setAttribute("x",this.posX+1),s.setAttribute("y",this.posY+5),s.setAttribute("text-anchor","middle"),s.setAttribute("alignment-baseline","central"),s.setAttribute("style","fill: red; font-family: Arial, sans-serif; font-size: 25px"),s.innerHTML=this.char,this.nextNodesByChar.forEach(e=>{let s=new a(this.posX,this.posY,e.posX,e.posY,"stroke:rgb(0,0,0);stroke-width:2");s.shorten(r),s.renderTo(t),e.renderTo(t)}),this.suffixLink){let e=new a(this.posX,this.posY,this.suffixLink.posX,this.suffixLink.posY,"stroke:rgb(0,0,255);stroke-width:2",-5);e.shorten(r),e.renderTo(t)}this.endSuffixLinks.forEach(e=>{let s=new a(this.posX,this.posY,e.posX,e.posY,"stroke:rgb(0,255,0);stroke-width:2",-10);s.shorten(r),s.renderTo(t)}),t.appendChild(e),t.appendChild(s)}}class a{constructor(t,e,s,i,n,o=null){this.x1=t,this.y1=e,this.x2=s,this.y2=i,this.style=n,this.length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1)),this.shift=o}renderTo(t){const e=(this.x1-this.x2)/this.length,s=(this.y1-this.y2)/this.length;let i=Math.acos(e);s<0&&(i=Math.PI-i);const n=Math.cos(i+Math.PI/2),r=Math.sin(i+Math.PI/2);this.shift&&(this.x1+=this.shift*n,this.y1+=this.shift*r,this.x2+=this.shift*n,this.y2+=this.shift*r);let h=this.x2+10*e,d=this.y2+10*s,l=h+5*n,a=d+5*r,c=h+-5*n,u=d+-5*r,f=document.createElementNS(o,"line");f.setAttribute("x1",this.x1),f.setAttribute("y1",this.y1),f.setAttribute("x2",this.x2),f.setAttribute("y2",this.y2),f.setAttribute("style",this.style),t.appendChild(f);let p=document.createElementNS(o,"line");p.setAttribute("x1",l),p.setAttribute("y1",a),p.setAttribute("x2",this.x2),p.setAttribute("y2",this.y2),p.setAttribute("style",this.style),t.appendChild(p);let x=document.createElementNS(o,"line");x.setAttribute("x1",c),x.setAttribute("y1",u),x.setAttribute("x2",this.x2),x.setAttribute("y2",this.y2),x.setAttribute("style",this.style),t.appendChild(x)}shorten(t){const e=this.length-t;this.y2=this.y1+(this.y2-this.y1)/this.length*e,this.x2=this.x1+(this.x2-this.x1)/this.length*e,this.length=e}}class c{constructor(){this.root=new l(null),this.nodes=[]}addWordToNode(t,e,s=0){if(s===e.length)return void t.addEndOfWord(e);let i=e[s],n=t.getNextNodeByChar(i);n||((n=new l(i)).depth=s,this.nodes.push(n),t.addNextNode(n)),this.addWordToNode(n,e,s+1)}findSuffixLink(t,e=this.root){for(let[s,i]of e.nextNodesByChar)s===t.char&&(i===t?t.suffixLink=e:(t.nextNodesByChar.forEach(t=>{this.findSuffixLink(t,i)}),(!t.suffixLink||i.depth>t.suffixLink.depth)&&(t.suffixLink=i),i.wordEndings.length>0&&t.endSuffixLinks.push(i)));t.nextNodesByChar.forEach(t=>{this.findSuffixLink(t)})}addWord(t){this.addWordToNode(this.root,t)}finish(){this.root.nextNodesByChar.forEach(t=>{this.findSuffixLink(t)})}createSVG(){let{width:t,height:e}=this.root.calcLayout(),s=document.createElementNS(o,"svg");return s.setAttribute("height",e),s.setAttribute("width",t),this.root.calcPosition(),this.root.renderTo(s),s}matchText(t){let e=this.root,s=[];for(let i of t){let t=[];for(;;){let s=e.nextNodesByChar.get(i);if(s){let i={move:{from:e,to:s}};t.push(i),s.wordEndings.forEach(e=>{let s={ending:e};t.push(s)}),s.endSuffixLinks.forEach(e=>{e.wordEndings.forEach(e=>{let s={ending:e};t.push(s)})}),e=s;break}if(e.suffixLink){let s={move:{from:e,to:e.suffixLink}};e=e.suffixLink,t.push(s)}else{if(e===this.root){let e={drop:!0};t.push(e);break}{let s={move:{from:e,to:this.root}};e=this.root,t.push(s)}}}let n={char:i,subActions:t};s.push(n)}return s}}const u=[],f=document.getElementById("words");function p(t){let e=function(){let t=i[n];return n=(n+1)%i.length,t}(),s={word:t,color:e};u.push(s);const o=document.createElement("div");o.style.backgroundColor=e;const r=document.createElement("a");r.innerText="❌",r.addEventListener("click",()=>{u.splice(u.lastIndexOf(s),1),f.removeChild(o),w(),m()},{once:!0});const h=document.createElement("span");h.textContent=t,h.className="word-item-text",o.appendChild(h),o.appendChild(r),f.appendChild(o)}["a","ab","bab","bc","bca","c","caa"].forEach(t=>{p(t)});const x=document.getElementById("match-result"),y=document.getElementById("text-input");function m(){x.innerHTML="";const t=document.createElement("tr");let e=y.value;e.length>0&&(x.style.marginTop="-1.6rem");for(let s of e){const e=document.createElement("td");e.innerText=s,e.className="hidden-char",t.appendChild(e)}x.appendChild(t);let s=new Map;for(let{word:t,color:i}of u){const n=document.createElement("tr");s.set(t,{tr:n,color:i}),x.appendChild(n);for(let t of e){const t=document.createElement("td");n.appendChild(t)}}let i=g.matchText(e),n=0;for(let t of i){for(let e of t.subActions){let{ending:t}=e;if(t){let{tr:e,color:i}=s.get(t);for(let s=n-t.length+1;s<=n;s++){const t=e.childNodes[s];t.style.backgroundColor=i,t.className="found-char",s===n&&(t.className+=" found-char-last")}}}n++}}document.getElementById("play-pause-button").addEventListener("click",m);const b=document.getElementById("new-word-input");document.getElementById("new-word-submit").addEventListener("click",t=>{return t.preventDefault(),p(b.value),b.value="",w(),!1},!1);let g,E=document.getElementById("graph");function w(){g=new c;for(let{word:t}of u)g.addWord(t);g.finish(),E.innerHTML="",E.appendChild(g.createSVG()),m()}w()}]);