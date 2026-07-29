(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))c(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&c(r)}).observe(document,{childList:!0,subtree:!0});function o(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function c(t){if(t.ep)return;t.ep=!0;const a=o(t);fetch(t.href,a)}})();const m={},g="0x24eb476d0E7B9d2099323E633FF0f16f5A64c067",E="https://openapi.msu.io/v1rc1",S=typeof import.meta<"u"&&(m==null?void 0:m.VITE_MSU_API_KEY)||"gw_ee0c11f21ce4cfe148de4ab82711802f79fcbc73e8519dba0ac82d797e65c162c5468bf2f0629473707c2800b7912c4e24f99edc13d50afe748e5f7f32c54664",B="msu_cache",_=`${B}/raffle_info`,T=3,N=1e3,w=500;Promise.resolve();let v=0;function p(e=window.location.search){if(!e)return g;const s=new URLSearchParams(e.startsWith("?")?e.slice(1):e);return s.get("walletAddress")||s.get("address")||g}function U(e){var o;const s=((o=e==null?void 0:e.data)==null?void 0:o.characters)??(e==null?void 0:e.characters)??(e==null?void 0:e.data)??[];return(Array.isArray(s)?s:[]).map(c=>{var f,h,u;const t=(c==null?void 0:c.character)??c,a=(c==null?void 0:c.data)??(t==null?void 0:t.data)??t??{},r=(c==null?void 0:c.name)??(t==null?void 0:t.name)??"Unknown",i=(a==null?void 0:a.level)??(t==null?void 0:t.level)??(c==null?void 0:c.level)??0,n=(a==null?void 0:a.imageUrl)??(t==null?void 0:t.imageUrl)??(c==null?void 0:c.imageUrl)??"",d=((f=a==null?void 0:a.job)==null?void 0:f.jobName)??((h=t==null?void 0:t.job)==null?void 0:h.jobName)??((u=c==null?void 0:c.job)==null?void 0:u.jobName)??"";return{...c,character:r,name:r,data:a,level:i,imageUrl:n,job:d}})}function x(e){return`msu_cache/characters/${e}/characters.json`}function L(e){try{const s=localStorage.getItem(e);return s?JSON.parse(s):null}catch(s){return console.warn("Failed to read cache file:",s),null}}function R(e,s){localStorage.setItem(e,JSON.stringify(s))}async function $(e){return new Promise(s=>window.setTimeout(s,e))}async function D(e,s={},{retryCount:o=T,retryDelayMs:c=N}={}){let t;for(let a=0;a<o;a+=1)try{const i=Date.now()-v;i<w&&await $(w-i),v=Date.now();const n=await fetch(e,s);if(!n.ok)throw new Error(`HTTP ${n.status}`);return await n.json()}catch(r){t=r,a<o-1&&await $(c*(a+1))}throw t}async function I(e){const s=`${E}/accounts/${encodeURIComponent(e)}/characters`;return await D(s,{headers:{"Content-Type":"application/json","x-nxopen-api-key":S}})}async function M(e){const s=x(e),o=L(s);if(o)return o;const c=await I(e);return R(s,c),c}async function O(e=p()){const s=await M(e);return U(s)}async function y(e,s=p()){const o=`${E}/msn/characters/${encodeURIComponent(e)}/raffles?walletAddress=${encodeURIComponent(s)}`;return D(o,{headers:{"Content-Type":"application/json","x-nxopen-api-key":S}})}async function F(e,s=p()){const o=`${_}/${s}/${e}.json`,c=L(o);if(c)return c;const t=await y(e,s);return R(o,t),t}const K=["305014","305001","304003","306322","308071","308070","305024"],q={205035:"N.Damien",205038:"Boss205038",205030:"Boss205030",205028:"Boss205028",205029:"Boss205029",205031:"Boss205031",205034:"Boss205034",205032:"Boss205032",205033:"Boss205033",205039:"E.Lucid",304001:"Boss304001"},C=["Daily Quest","Dungeon Clear","Guild Donation","Pet Feed","Ride Check"],k=document.querySelector("#debug-json"),H=[{icon:"🧙",character:"キャラA",level:175,linkBuff:!0,tasks:[{label:"Daily Quest",done:!0,type:"checkbox"},{label:"Dungeon Clear",done:!1,type:"toggle"},{label:"Guild Donation",done:!0,type:"checkbox"},{label:"Pet Feed",done:!1,type:"toggle"},{label:"Ride Check",done:!0,type:"checkbox"}]},{icon:"🏹",character:"キャラB",level:172,linkBuff:!1,tasks:[{label:"Daily Quest",done:!1,type:"checkbox"},{label:"Dungeon Clear",done:!0,type:"toggle"},{label:"Guild Donation",done:!1,type:"checkbox"},{label:"Pet Feed",done:!0,type:"toggle"},{label:"Ride Check",done:!1,type:"checkbox"}]}],Y=[{name:"Abyss Boss",defeated:2,total:3,status:"進行中"},{name:"Weekly Boss",defeated:1,total:1,status:"完了"},{name:"Elite Boss",defeated:0,total:2,status:"未着手"}];function A(e){k&&(k.textContent=e)}function J(e){return typeof e=="string"?e:JSON.stringify(e,null,2)}async function j(){try{const e=p(),s=await O(e),o=s.map(c=>{var d,f;const t=c.data??{},a=c.character??c.name??"Unknown",r=t.level??0,i=t.imageUrl??"",n=((d=t.job)==null?void 0:d.jobName)??"";return{icon:i,character:a,level:r,job:n,assetKey:c.assetKey??((f=c.data)==null?void 0:f.assetKey)??"",linkBuff:!0,tasks:C.map((h,u)=>({label:h,done:u%2===0,type:u%2===0?"checkbox":"toggle"}))}}).sort((c,t)=>t.level-c.level);return A(`wallet: ${e}

${J(s).slice(0,4e3)}`),o}catch(e){return console.error("Character fetch failed:",e),A(`ERROR
${e instanceof Error?e.message:String(e)}`),H}}function W(e){const s=document.querySelector("#daily-board");if(!s)return;const o=C.map(t=>`<th>${t}</th>`).join(""),c=e.map(t=>{const a=t.tasks.map(i=>{const n=i.done?"checked":"";return`<td>${i.type==="toggle"?`<label class="switch"><input type="checkbox" ${n} /><span class="slider"></span></label>`:`<input class="task-check" type="checkbox" ${n} />`}</td>`}).join("");return`
        <tr>
          <td>
            <div class="char-cell">
              ${t.icon?`<img class="char-icon-img" src="${t.icon}" alt="${t.character}" />`:`<span class="char-icon">${t.icon||"🧙"}</span>`}
              <div>
                <div class="char-name">${t.character}</div>
                <div class="char-meta">Lv. ${t.level}${t.job?` · ${t.job}`:""}</div>
              </div>
            </div>
          </td>
          <td><label class="switch"><input type="checkbox" ${t.linkBuff?"checked":""} /><span class="slider"></span></label></td>
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
  `}async function P(){const e=document.querySelector("#daily-board");if(!e)return;e.innerHTML='<div class="loading-text">キャラクター一覧を取得中...</div>';const s=await j();W(s)}function Q(){const e=document.querySelector("#boss-board");e&&(e.innerHTML=Y.map(s=>`
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
      `).join(""))}async function G(){const e=document.querySelector("#weekly-board");if(!e)return;e.innerHTML='<div class="loading-text">キャラクター情報を読み込み中...</div>';const s=p(),c=(await j()).slice(0,15),t=await Promise.all(c.map(async(a,r)=>{var u,b;const i=a.assetKey||((u=a.data)==null?void 0:u.assetKey)||"",n=i?await F(i,s):null,d=(((b=n==null?void 0:n.data)==null?void 0:b.informations)||[]).map(l=>l==null?void 0:l.layerId).filter(Boolean).map(l=>String(l)).filter(l=>!K.includes(l)).map(l=>q[l]||l),f=d.length>0?d.map(l=>`<span class="boss-name-chip">${l}</span>`).join(""):"";return`
        <tr>
          <td>
            <div class="char-cell">
              ${a.icon?`<img class="char-icon-img" src="${a.icon}" alt="${a.character}" />`:'<span class="char-icon">🧙</span>'}
              <div>
                <div class="char-name">${a.character}</div>
                <div class="char-meta">Lv. ${a.level}${a.job?` · ${a.job}`:""}</div>
              </div>
            </div>
          </td>
          <td><span class="boss-name-pill">${f}</span></td>
        </tr>
      `}));e.innerHTML=`
    <div class="weekly-character-table-wrap">
      <table class="weekly-character-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>${t.join("")}</tbody>
      </table>
    </div>
  `}function V(){const e=document.querySelectorAll(".tab-button"),s=document.querySelectorAll(".view-panel");e.forEach(o=>{o.addEventListener("click",()=>{const c=o.dataset.view;e.forEach(t=>{const a=t===o;t.classList.toggle("active",a),t.setAttribute("aria-selected",String(a))}),s.forEach(t=>{t.classList.toggle("active",t.dataset.view===c)})})})}P();Q();G();V();
