import { fetchCharacterList, getWalletAddressFromUrl, loadCharacterRaffleInformation } from './msuApi.js';
import { NON_BOSS_LAYER_IDS } from '../config/nonBossLayerIds.js';
import { LAYER_ID_TO_BOSS_NAME } from '../config/layerIdToBossName.js';

const DAILY_TASK_LABELS = ['Daily Quest', 'Dungeon Clear', 'Guild Donation', 'Pet Feed', 'Ride Check'];
const debugJsonElement = document.querySelector('#debug-json');

const fallbackDailyData = [
  {
    icon: '🧙',
    character: 'キャラA',
    level: 175,
    linkBuff: true,
    tasks: [
      { label: 'Daily Quest', done: true, type: 'checkbox' },
      { label: 'Dungeon Clear', done: false, type: 'toggle' },
      { label: 'Guild Donation', done: true, type: 'checkbox' },
      { label: 'Pet Feed', done: false, type: 'toggle' },
      { label: 'Ride Check', done: true, type: 'checkbox' }
    ]
  },
  {
    icon: '🏹',
    character: 'キャラB',
    level: 172,
    linkBuff: false,
    tasks: [
      { label: 'Daily Quest', done: false, type: 'checkbox' },
      { label: 'Dungeon Clear', done: true, type: 'toggle' },
      { label: 'Guild Donation', done: false, type: 'checkbox' },
      { label: 'Pet Feed', done: true, type: 'toggle' },
      { label: 'Ride Check', done: false, type: 'checkbox' }
    ]
  }
];

const bossData = [
  { name: 'Abyss Boss', defeated: 2, total: 3, status: '進行中' },
  { name: 'Weekly Boss', defeated: 1, total: 1, status: '完了' },
  { name: 'Elite Boss', defeated: 0, total: 2, status: '未着手' }
];

const dummyBossNames = ['Abyss Boss', 'Weekly Boss', 'Elite Boss', 'Raid Boss', 'Dungeon Boss'];

function setDebugJson(message) {
  if (!debugJsonElement) return;
  debugJsonElement.textContent = message;
}

function formatDebugJson(message) {
  return typeof message === 'string' ? message : JSON.stringify(message, null, 2);
}

async function loadCharacterRows() {
  try {
    const walletAddress = getWalletAddressFromUrl();
    const payload = await fetchCharacterList(walletAddress);
    const rows = payload
      .map((entry) => {
        const characterData = entry.data ?? {};
        const name = entry.character ?? entry.name ?? 'Unknown';
        const level = characterData.level ?? 0;
        const imageUrl = characterData.imageUrl ?? '';
        const jobName = characterData.job?.jobName ?? '';

        return {
          icon: imageUrl,
          character: name,
          level,
          job: jobName,
          assetKey: entry.assetKey ?? entry.data?.assetKey ?? '',
          linkBuff: true,
          tasks: DAILY_TASK_LABELS.map((label, index) => ({
            label,
            done: index % 2 === 0,
            type: index % 2 === 0 ? 'checkbox' : 'toggle'
          }))
        };
      })
      .sort((a, b) => b.level - a.level);

    setDebugJson(`wallet: ${walletAddress}\n\n${formatDebugJson(payload).slice(0, 4000)}`);
    return rows;
  } catch (error) {
    console.error('Character fetch failed:', error);
    setDebugJson(`ERROR\n${error instanceof Error ? error.message : String(error)}`);
    return fallbackDailyData;
  }
}

function renderDailyTable(entries) {
  const container = document.querySelector('#daily-board');
  if (!container) return;

  const taskHeaders = DAILY_TASK_LABELS.map((label) => `<th>${label}</th>`).join('');
  const rows = entries
    .map((entry) => {
      const cells = entry.tasks
        .map((task) => {
          const checked = task.done ? 'checked' : '';
          const control =
            task.type === 'toggle'
              ? `<label class="switch"><input type="checkbox" ${checked} /><span class="slider"></span></label>`
              : `<input class="task-check" type="checkbox" ${checked} />`;

          return `<td>${control}</td>`;
        })
        .join('');

      const iconMarkup = entry.icon
        ? `<img class="char-icon-img" src="${entry.icon}" alt="${entry.character}" />`
        : `<span class="char-icon">${entry.icon || '🧙'}</span>`;

      return `
        <tr>
          <td>
            <div class="char-cell">
              ${iconMarkup}
              <div>
                <div class="char-name">${entry.character}</div>
                <div class="char-meta">Lv. ${entry.level}${entry.job ? ` · ${entry.job}` : ''}</div>
              </div>
            </div>
          </td>
          <td><label class="switch"><input type="checkbox" ${entry.linkBuff ? 'checked' : ''} /><span class="slider"></span></label></td>
          ${cells}
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="daily-table-wrap">
      <table class="daily-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>LinkBuff</th>
            ${taskHeaders}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

async function renderDaily() {
  const container = document.querySelector('#daily-board');
  if (!container) return;

  container.innerHTML = '<div class="loading-text">キャラクター一覧を取得中...</div>';
  const characterRows = await loadCharacterRows();
  renderDailyTable(characterRows);
}

function renderBoss() {
  const container = document.querySelector('#boss-board');
  if (!container) return;

  container.innerHTML = bossData
    .map(
      (boss) => `
        <article class="info-card">
          <div class="card-title-row">
            <h3>${boss.name}</h3>
            <span class="status-badge">${boss.status}</span>
          </div>
          <p class="progress-text">${boss.defeated}/${boss.total} 消化</p>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${(boss.defeated / boss.total) * 100}%"></div>
          </div>
        </article>
      `
    )
    .join('');
}

async function renderWeeklyRewards() {
  const container = document.querySelector('#weekly-board');
  if (!container) return;

  container.innerHTML = '<div class="loading-text">キャラクター情報を読み込み中...</div>';
  const walletAddress = getWalletAddressFromUrl();
  const characterRows = await loadCharacterRows();
  const selectedCharacters = characterRows.slice(0, 15); // count character

  const rows = await Promise.all(
    selectedCharacters.map(async (entry, index) => {
      const characterAssetKey = entry.assetKey || entry.data?.assetKey || '';
      const rafflePayload = characterAssetKey
        ? await loadCharacterRaffleInformation(characterAssetKey, walletAddress)
        : null;

      const bossNames = (rafflePayload?.data?.informations || [])
        .map((information) => information?.layerId)
        .filter(Boolean)
        .map((layerId) => String(layerId))
        .filter((layerId) => !NON_BOSS_LAYER_IDS.includes(layerId))
        .map((layerId) => LAYER_ID_TO_BOSS_NAME[layerId] || layerId);

      const bossName = bossNames.length > 0
        ? bossNames.map((layerId) => `<span class="boss-name-chip">${layerId}</span>`).join('')
        : '';
      const iconMarkup = entry.icon
        ? `<img class="char-icon-img" src="${entry.icon}" alt="${entry.character}" />`
        : `<span class="char-icon">🧙</span>`;

      return `
        <tr>
          <td>
            <div class="char-cell">
              ${iconMarkup}
              <div>
                <div class="char-name">${entry.character}</div>
                <div class="char-meta">Lv. ${entry.level}${entry.job ? ` · ${entry.job}` : ''}</div>
              </div>
            </div>
          </td>
          <td><span class="boss-name-pill">${bossName}</span></td>
        </tr>
      `;
    })
  );

  container.innerHTML = `
    <div class="weekly-character-table-wrap">
      <table class="weekly-character-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  const views = document.querySelectorAll('.view-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.view;

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      views.forEach((view) => {
        view.classList.toggle('active', view.dataset.view === target);
      });
    });
  });
}

renderDaily();
renderBoss();
renderWeeklyRewards();
setupTabs();
