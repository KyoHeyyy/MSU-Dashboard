(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(t){if(t.ep)return;t.ep=!0;const o=a(t);fetch(t.href,o)}})();const m={},v="0x24eb476d0E7B9d2099323E633FF0f16f5A64c067",R="https://openapi.msu.io/v1rc1",D=typeof import.meta<"u"&&(m==null?void 0:m.VITE_MSU_API_KEY)||"gw_ee0c11f21ce4cfe148de4ab82711802f79fcbc73e8519dba0ac82d797e65c162c5468bf2f0629473707c2800b7912c4e24f99edc13d50afe748e5f7f32c54664",_=3,M=1e3,$=500,g="cache:",O=5*60*1e3;let C=Promise.resolve(),k=0;function w(){try{return typeof sessionStorage>"u"?null:sessionStorage}catch{return null}}function N(e){const s=w();if(!s)return null;const a=g+e;let n;try{n=s.getItem(a)}catch(t){return console.warn(`Failed to read cache: ${e}`,t),null}if(!n)return null;try{const t=JSON.parse(n);return!t||!Number.isFinite(t.expiresAt)||Date.now()>t.expiresAt?(s.removeItem(a),null):t.value}catch(t){console.warn(`Failed to parse cache: ${e}`,t);try{s.removeItem(a)}catch{}return null}}function I(e,s){const a=w();if(!a)return;const n=Date.now(),t={value:s,createdAt:n,expiresAt:n+O};try{a.setItem(g+e,JSON.stringify(t))}catch(o){console.warn(`Failed to save cache: ${e}`,o)}}function F(){const e=w();if(!e)return;const s=Date.now();for(let a=e.length-1;a>=0;a-=1){const n=e.key(a);if(n!=null&&n.startsWith(g))try{const t=JSON.parse(e.getItem(n));(!t||!Number.isFinite(t.expiresAt)||s>t.expiresAt)&&e.removeItem(n)}catch{try{e.removeItem(n)}catch{}}}}F();function p(e=window.location.search){if(!e)return v;const s=new URLSearchParams(e.startsWith("?")?e.slice(1):e);return s.get("walletAddress")||s.get("address")||v}function q(e){var a;const s=((a=e==null?void 0:e.data)==null?void 0:a.characters)??(e==null?void 0:e.characters)??(e==null?void 0:e.data)??[];return(Array.isArray(s)?s:[]).map(n=>{var d,h,c;const t=(n==null?void 0:n.character)??n,o=(n==null?void 0:n.data)??(t==null?void 0:t.data)??t??{},r=(n==null?void 0:n.name)??(t==null?void 0:t.name)??"Unknown",i=(o==null?void 0:o.level)??(t==null?void 0:t.level)??(n==null?void 0:n.level)??0,l=(o==null?void 0:o.imageUrl)??(t==null?void 0:t.imageUrl)??(n==null?void 0:n.imageUrl)??"",u=((d=o==null?void 0:o.job)==null?void 0:d.jobName)??((h=t==null?void 0:t.job)==null?void 0:h.jobName)??((c=n==null?void 0:n.job)==null?void 0:c.jobName)??"";return{...n,character:r,name:r,data:o,level:i,imageUrl:l,job:u}})}async function A(e){return new Promise(s=>window.setTimeout(s,e))}async function j(e,s={},{retryCount:a=_,retryDelayMs:n=M}={}){const t=async()=>{let r;for(let i=0;i<a;i+=1)try{const u=Date.now()-k;u<$&&await A($-u),k=Date.now();const d=await fetch(e,s);if(!d.ok)throw new Error(`HTTP ${d.status}`);return await d.json()}catch(l){r=l,i<a-1&&await A(n*(i+1))}throw r},o=C.then(t,t);return C=o.catch(()=>{}),o}async function H(e){const s=`${R}/accounts/${encodeURIComponent(e)}/characters?size=100`;return await j(s,{headers:{"Content-Type":"application/json","x-nxopen-api-key":D}})}function K(e){return`characters:${e}`}function W(e,s){return`raffle:${s}:${e}`}async function Y(e){const s=K(e),a=N(s);if(a!==null)return a;const n=await H(e);return I(s,n),n}async function J(e=p()){const s=await Y(e);return q(s)}async function Q(e,s=p()){const a=`${R}/msn/characters/${encodeURIComponent(e)}/raffles?walletAddress=${encodeURIComponent(s)}`;return j(a,{headers:{"Content-Type":"application/json","x-nxopen-api-key":D}})}async function V(e,s=p()){const a=W(e,s),n=N(a);if(console.log(`Loading raffle info for ${e} and wallet ${s}. Cache hit: ${n!==null}`),n!==null)return n;const t=await Q(e,s);return I(a,t),t}const G=["305014","305001","304003","306322","308071","308070","305024","304001","305023","500002","500001","500004","500003","308065","308068","308066","308067"],z={205035:"N.Damien",205038:"N.Slime",205030:"C.Queen",205028:"C.Pierre",205029:"C.VonBon",205031:"H.Magnus",205034:"N.Lotus",205032:"C.Vellum",205033:"C.Papulatus",205039:"E.Lucid",205025:"C.PinkBean",305023:"305023",500004:"500004",500002:"500002",500001:"500001",305023:"305023",205027:"C.Zakum",205026:"C.Cygnus",205023:"E.Cygnus",205024:"H.Hilla"},x=["Daily Quest","Dungeon Clear","Guild Donation","Pet Feed","Ride Check"],S=document.querySelector("#debug-json"),f=document.createElement("div");f.id="loading-indicator";f.className="loading-indicator";f.setAttribute("aria-live","polite");f.innerHTML='<span class="loading-spinner"></span><span>読み込み中</span>';f.style.display="none";document.body.appendChild(f);var b=0;function T(){f&&(f.style.display="flex")}function B(){f&&(f.style.display="none")}const P=[{icon:"🧙",character:"キャラA",level:175,linkBuff:!0,tasks:[{label:"Daily Quest",done:!0,type:"checkbox"},{label:"Dungeon Clear",done:!1,type:"toggle"},{label:"Guild Donation",done:!0,type:"checkbox"},{label:"Pet Feed",done:!1,type:"toggle"},{label:"Ride Check",done:!0,type:"checkbox"}]},{icon:"🏹",character:"キャラB",level:172,linkBuff:!1,tasks:[{label:"Daily Quest",done:!1,type:"checkbox"},{label:"Dungeon Clear",done:!0,type:"toggle"},{label:"Guild Donation",done:!1,type:"checkbox"},{label:"Pet Feed",done:!0,type:"toggle"},{label:"Ride Check",done:!1,type:"checkbox"}]}],X=[{name:"Abyss Boss",defeated:2,total:3,status:"進行中"},{name:"Weekly Boss",defeated:1,total:1,status:"完了"},{name:"Elite Boss",defeated:0,total:2,status:"未着手"}];function E(e){S&&(S.textContent=e)}function Z(e){return typeof e=="string"?e:JSON.stringify(e,null,2)}async function U(){try{const e=p(),s=await J(e),a=s.map(n=>{var u,d;const t=n.data??{},o=n.character??n.name??"Unknown",r=t.level??0,i=t.imageUrl??"",l=((u=t.job)==null?void 0:u.jobName)??"";return{icon:i,character:o,level:r,job:l,assetKey:n.assetKey??((d=n.data)==null?void 0:d.assetKey)??"",linkBuff:!0,tasks:x.map((h,c)=>({label:h,done:c%2===0,type:c%2===0?"checkbox":"toggle"}))}}).sort((n,t)=>t.level-n.level);return E(`wallet: ${e}

${Z(s).slice(0,4e3)}`),a}catch(e){return console.error("Character fetch failed:",e),E(`ERROR
${e instanceof Error?e.message:String(e)}`),P}}function y(e){const s=document.querySelector("#daily-board");if(!s)return;const a=x.map(t=>`<th>${t}</th>`).join(""),n=e.length>0?e.map(t=>{const o=t.tasks.map(i=>{const l=i.done?"checked":"";return`<td>${i.type==="toggle"?`<label class="switch"><input type="checkbox" ${l} /><span class="slider"></span></label>`:`<input class="task-check" type="checkbox" ${l} />`}</td>`}).join("");return`
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
              ${o}
            </tr>
          `}).join(""):'<tr><td colspan="7"></td></tr>';s.innerHTML=`
    <div class="daily-table-wrap">
      <table class="daily-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>LinkBuff</th>
            ${a}
          </tr>
        </thead>
        <tbody>
          ${n}
        </tbody>
      </table>
    </div>
  `}async function ee(){if(document.querySelector("#daily-board")){T(),y([]);try{const s=await U();y(s)}finally{B()}}}function te(){const e=document.querySelector("#boss-board");e&&(e.innerHTML=X.map(s=>`
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
      `).join(""))}function ne(e){var a;const s=((a=e==null?void 0:e.data)==null?void 0:a.informations)??(e==null?void 0:e.informations)??[];return Array.isArray(s)?s:[]}function L(e=[]){const s=document.querySelector("#weekly-board");if(!s)return;const a=e.map(n=>{const t=n.icon?`<img class="char-icon-img" src="${n.icon}" alt="${n.character}" />`:'<span class="char-icon">🧙</span>',o=n.loading?'<span class="boss-name-pill loading-boss-pill">取得中</span>':n.failed?'<span class="boss-name-pill failed-boss-pill">取得失敗</span>':n.bossName?`<span class="boss-name-pill">${n.bossName}</span>`:'<span class="boss-name-pill">-</span>';return`
        <tr>
          <td>
            <div class="char-cell">
              ${t}
              <div>
                <div class="char-name">${n.character}</div>
                <div class="char-meta">Lv. ${n.level}${n.job?` · ${n.job}`:""}</div>
              </div>
            </div>
          </td>
          <td>${o}</td>
        </tr>
      `}).join("");s.innerHTML=`
    <div class="weekly-character-table-wrap">
      <table class="weekly-character-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
    </div>
  `}async function se(){var a;if(!document.querySelector("#weekly-board"))return;T();const s=p();try{const t=(await U()).slice(0,5),o=t.map(r=>({...r,loading:!0,bossName:""}));L(o);for(const[r,i]of t.entries()){try{const l=i.assetKey||((a=i.data)==null?void 0:a.assetKey)||"",u=l?await V(l,s):null,d=ne(u).map(c=>c==null?void 0:c.layerId).filter(Boolean).map(c=>String(c)).filter(c=>!G.includes(c)).map(c=>z[c]||c);b+=d.length,console.log(`Character: ${i.character}, Bosses: ${d.join(", ")}, Total Boss Count: ${b}`);const h=d.length>0?d.map(c=>`<span class="boss-name-chip">${c}</span>`).join(""):"";o[r]={...i,loading:!1,failed:!1,bossName:h}}catch(l){console.error("Weekly reward fetch failed:",l),o[r]={...i,loading:!1,failed:!0,bossName:""}}L(o),ae(b)}}finally{B()}}async function ae(e){const s=document.querySelector("#boss-progress");s&&(s.innerHTML=`<strong>${e} / 90</strong>`)}function oe(){const e=document.querySelectorAll(".tab-button"),s=document.querySelectorAll(".view-panel");e.forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.view;e.forEach(t=>{const o=t===a;t.classList.toggle("active",o),t.setAttribute("aria-selected",String(o))}),s.forEach(t=>{t.classList.toggle("active",t.dataset.view===n)})})})}ee();te();se();oe();
