(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function c(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=c(e);fetch(e.href,r)}})();const b="/navigator/api/navigator/inventory/0x24eb476d0E7B9d2099323E633FF0f16f5A64c067/characters-v2?size=42",h=["Daily Quest","Dungeon Clear","Guild Donation","Pet Feed","Ride Check"],u=document.querySelector("#debug-json"),g=[{icon:"🧙",character:"キャラA",level:175,linkBuff:!0,tasks:[{label:"Daily Quest",done:!0,type:"checkbox"},{label:"Dungeon Clear",done:!1,type:"toggle"},{label:"Guild Donation",done:!0,type:"checkbox"},{label:"Pet Feed",done:!1,type:"toggle"},{label:"Ride Check",done:!0,type:"checkbox"}]},{icon:"🏹",character:"キャラB",level:172,linkBuff:!1,tasks:[{label:"Daily Quest",done:!1,type:"checkbox"},{label:"Dungeon Clear",done:!0,type:"toggle"},{label:"Guild Donation",done:!1,type:"checkbox"},{label:"Pet Feed",done:!0,type:"toggle"},{label:"Ride Check",done:!1,type:"checkbox"}]}],y=[{name:"Abyss Boss",defeated:2,total:3,status:"進行中"},{name:"Weekly Boss",defeated:1,total:1,status:"完了"},{name:"Elite Boss",defeated:0,total:2,status:"未着手"}],m=[{walletId:"xxxxxxxx",account:"Account 01",characters:[{name:"キャラA",reward:"Legendary Chest"},{name:"キャラB",reward:"Epic Chest"},{name:"キャラC",reward:"Rare Chest"}]}];function f(t){u&&(u.textContent=t)}function v(t){return typeof t=="string"?t:JSON.stringify(t,null,2)}async function k(){try{const t=await fetch(b),a=await t.text();if(f(`status: ${t.status}

${v(a).slice(0,4e3)}`),!t.ok)throw new Error(`API error: ${t.status}`);const c=JSON.parse(a);return((c==null?void 0:c.characters)??[]).map(e=>{var r,o,n,l,i;return{icon:((r=e.character)==null?void 0:r.imageUrl)??"",character:((o=e.character)==null?void 0:o.name)??"Unknown",level:((n=e.character)==null?void 0:n.level)??0,job:((i=(l=e.character)==null?void 0:l.job)==null?void 0:i.jobName)??"",linkBuff:!0,tasks:h.map((p,d)=>({label:p,done:d%2===0,type:d%2===0?"checkbox":"toggle"}))}}).sort((e,r)=>r.level-e.level)}catch(t){return console.error("Character fetch failed:",t),f(`ERROR
${t instanceof Error?t.message:String(t)}`),g}}function w(t){const a=document.querySelector("#daily-board");if(!a)return;const c=h.map(e=>`<th>${e}</th>`).join(""),s=t.map(e=>{const r=e.tasks.map(n=>{const l=n.done?"checked":"";return`<td>${n.type==="toggle"?`<label class="switch"><input type="checkbox" ${l} /><span class="slider"></span></label>`:`<input class="task-check" type="checkbox" ${l} />`}</td>`}).join("");return`
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
          ${r}
        </tr>
      `}).join("");a.innerHTML=`
    <div class="daily-table-wrap">
      <table class="daily-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>LinkBuff</th>
            ${c}
          </tr>
        </thead>
        <tbody>
          ${s}
        </tbody>
      </table>
    </div>
  `}async function $(){const t=document.querySelector("#daily-board");if(!t)return;t.innerHTML='<div class="loading-text">キャラクター一覧を取得中...</div>';const a=await k();w(a)}function x(){const t=document.querySelector("#boss-board");t&&(t.innerHTML=y.map(a=>`
        <article class="info-card">
          <div class="card-title-row">
            <h3>${a.name}</h3>
            <span class="status-badge">${a.status}</span>
          </div>
          <p class="progress-text">${a.defeated}/${a.total} 消化</p>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${a.defeated/a.total*100}%"></div>
          </div>
        </article>
      `).join(""))}function L(){const t=document.querySelector("#weekly-board");t&&(t.innerHTML=m.map(a=>`
        <article class="info-card">
          <div class="card-title-row">
            <h3>${a.account}</h3>
            <span class="count-badge">wallet: ${a.walletId}</span>
          </div>
          <ul class="reward-list">
            ${a.characters.map(c=>`
                  <li>
                    <strong>${c.name}</strong>
                    <span>${c.reward}</span>
                  </li>
                `).join("")}
          </ul>
        </article>
      `).join(""))}function D(){const t=document.querySelectorAll(".tab-button"),a=document.querySelectorAll(".view-panel");t.forEach(c=>{c.addEventListener("click",()=>{const s=c.dataset.view;t.forEach(e=>{const r=e===c;e.classList.toggle("active",r),e.setAttribute("aria-selected",String(r))}),a.forEach(e=>{e.classList.toggle("active",e.dataset.view===s)})})})}$();x();L();D();
