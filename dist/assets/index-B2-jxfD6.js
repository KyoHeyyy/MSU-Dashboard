(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const a of e)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&c(n)}).observe(document,{childList:!0,subtree:!0});function o(e){const a={};return e.integrity&&(a.integrity=e.integrity),e.referrerPolicy&&(a.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?a.credentials="include":e.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function c(e){if(e.ep)return;e.ep=!0;const a=o(e);fetch(e.href,a)}})();const f={},b="0x24eb476d0E7B9d2099323E633FF0f16f5A64c067",L="https://openapi.msu.io/v1rc1",S=typeof import.meta<"u"&&(f==null?void 0:f.VITE_MSU_API_KEY)||"gw_ee0c11f21ce4cfe148de4ab82711802f79fcbc73e8519dba0ac82d797e65c162c5468bf2f0629473707c2800b7912c4e24f99edc13d50afe748e5f7f32c54664",D=3,j=1e3,p=500;Promise.resolve();let m=0;function $(t=window.location.search){if(!t)return b;const s=new URLSearchParams(t.startsWith("?")?t.slice(1):t);return s.get("walletAddress")||s.get("address")||b}function R(t){var o;const s=((o=t==null?void 0:t.data)==null?void 0:o.characters)??(t==null?void 0:t.characters)??(t==null?void 0:t.data)??[];return(Array.isArray(s)?s:[]).map(c=>{var u,d,h;const e=(c==null?void 0:c.character)??c,a=(c==null?void 0:c.data)??(e==null?void 0:e.data)??e??{},n=(c==null?void 0:c.name)??(e==null?void 0:e.name)??"Unknown",i=(a==null?void 0:a.level)??(e==null?void 0:e.level)??(c==null?void 0:c.level)??0,r=(a==null?void 0:a.imageUrl)??(e==null?void 0:e.imageUrl)??(c==null?void 0:c.imageUrl)??"",l=((u=a==null?void 0:a.job)==null?void 0:u.jobName)??((d=e==null?void 0:e.job)==null?void 0:d.jobName)??((h=c==null?void 0:c.job)==null?void 0:h.jobName)??"";return{...c,character:n,name:n,data:a,level:i,imageUrl:r,job:l}})}function B(t){return`msu_cache/characters/${t}/characters.json`}function C(t){try{const s=localStorage.getItem(t);return s?JSON.parse(s):null}catch(s){return console.warn("Failed to read cache file:",s),null}}function T(t,s){localStorage.setItem(t,JSON.stringify(s))}async function g(t){return new Promise(s=>window.setTimeout(s,t))}async function U(t,s={},{retryCount:o=D,retryDelayMs:c=j}={}){let e;for(let a=0;a<o;a+=1)try{const i=Date.now()-m;i<p&&await g(p-i),m=Date.now();const r=await fetch(t,s);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(n){e=n,a<o-1&&await g(c*(a+1))}throw e}async function x(t){const s=`${L}/accounts/${encodeURIComponent(t)}/characters`;return await U(s,{headers:{"Content-Type":"application/json","x-nxopen-api-key":S}})}async function M(t){const s=B(t),o=C(s);if(o)return o;const c=await x(t);return T(s,c),c}async function N(t=$()){const s=await M(t);return R(s)}const A=["Daily Quest","Dungeon Clear","Guild Donation","Pet Feed","Ride Check"],w=document.querySelector("#debug-json"),F=[{icon:"🧙",character:"キャラA",level:175,linkBuff:!0,tasks:[{label:"Daily Quest",done:!0,type:"checkbox"},{label:"Dungeon Clear",done:!1,type:"toggle"},{label:"Guild Donation",done:!0,type:"checkbox"},{label:"Pet Feed",done:!1,type:"toggle"},{label:"Ride Check",done:!0,type:"checkbox"}]},{icon:"🏹",character:"キャラB",level:172,linkBuff:!1,tasks:[{label:"Daily Quest",done:!1,type:"checkbox"},{label:"Dungeon Clear",done:!0,type:"toggle"},{label:"Guild Donation",done:!1,type:"checkbox"},{label:"Pet Feed",done:!0,type:"toggle"},{label:"Ride Check",done:!1,type:"checkbox"}]}],_=[{name:"Abyss Boss",defeated:2,total:3,status:"進行中"},{name:"Weekly Boss",defeated:1,total:1,status:"完了"},{name:"Elite Boss",defeated:0,total:2,status:"未着手"}],v=["Abyss Boss","Weekly Boss","Elite Boss","Raid Boss","Dungeon Boss"];function k(t){w&&(w.textContent=t)}function y(t){return typeof t=="string"?t:JSON.stringify(t,null,2)}async function E(){try{const t=$(),s=await N(t),o=s.map(c=>{var l;const e=c.data??{},a=c.character??c.name??"Unknown",n=e.level??0,i=e.imageUrl??"",r=((l=e.job)==null?void 0:l.jobName)??"";return{icon:i,character:a,level:n,job:r,linkBuff:!0,tasks:A.map((u,d)=>({label:u,done:d%2===0,type:d%2===0?"checkbox":"toggle"}))}}).sort((c,e)=>e.level-c.level);return k(`wallet: ${t}

${y(s).slice(0,4e3)}`),o}catch(t){return console.error("Character fetch failed:",t),k(`ERROR
${t instanceof Error?t.message:String(t)}`),F}}function O(t){const s=document.querySelector("#daily-board");if(!s)return;const o=A.map(e=>`<th>${e}</th>`).join(""),c=t.map(e=>{const a=e.tasks.map(i=>{const r=i.done?"checked":"";return`<td>${i.type==="toggle"?`<label class="switch"><input type="checkbox" ${r} /><span class="slider"></span></label>`:`<input class="task-check" type="checkbox" ${r} />`}</td>`}).join("");return`
        <tr>
          <td>
            <div class="char-cell">
              ${e.icon?`<img class="char-icon-img" src="${e.icon}" alt="${e.character}" />`:`<span class="char-icon">${e.icon||"🧙"}</span>`}
              <div>
                <div class="char-name">${e.character}</div>
                <div class="char-meta">Lv. ${e.level}${e.job?` · ${e.job}`:""}</div>
              </div>
            </div>
          </td>
          <td><label class="switch"><input type="checkbox" ${e.linkBuff?"checked":""} /><span class="slider"></span></label></td>
          ${a}
        </tr>
      `}).join("");s.innerHTML=`
    <div class="daily-table-wrap">
      <table class="daily-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>LinkBuff</th>
            ${o}
          </tr>
        </thead>
        <tbody>
          ${c}
        </tbody>
      </table>
    </div>
  `}async function I(){const t=document.querySelector("#daily-board");if(!t)return;t.innerHTML='<div class="loading-text">キャラクター一覧を取得中...</div>';const s=await E();O(s)}function q(){const t=document.querySelector("#boss-board");t&&(t.innerHTML=_.map(s=>`
        <article class="info-card">
          <div class="card-title-row">
            <h3>${s.name}</h3>
            <span class="status-badge">${s.status}</span>
          </div>
          <p class="progress-text">${s.defeated}/${s.total} 消化</p>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${s.defeated/s.total*100}%"></div>
          </div>
        </article>
      `).join(""))}async function H(){const t=document.querySelector("#weekly-board");if(!t)return;t.innerHTML='<div class="loading-text">キャラクター情報を読み込み中...</div>';const o=(await E()).map((c,e)=>{const a=v[e%v.length];return`
        <tr>
          <td>
            <div class="char-cell">
              ${c.icon?`<img class="char-icon-img" src="${c.icon}" alt="${c.character}" />`:'<span class="char-icon">🧙</span>'}
              <div>
                <div class="char-name">${c.character}</div>
                <div class="char-meta">Lv. ${c.level}${c.job?` · ${c.job}`:""}</div>
              </div>
            </div>
          </td>
          <td><span class="boss-name-pill">${a}</span></td>
        </tr>
      `}).join("");t.innerHTML=`
    <div class="weekly-character-table-wrap">
      <table class="weekly-character-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>${o}</tbody>
      </table>
    </div>
  `}function W(){const t=document.querySelectorAll(".tab-button"),s=document.querySelectorAll(".view-panel");t.forEach(o=>{o.addEventListener("click",()=>{const c=o.dataset.view;t.forEach(e=>{const a=e===o;e.classList.toggle("active",a),e.setAttribute("aria-selected",String(a))}),s.forEach(e=>{e.classList.toggle("active",e.dataset.view===c)})})})}I();q();H();W();
