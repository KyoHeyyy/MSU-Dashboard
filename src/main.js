import { fetchCharacterList, getWalletAddressFromUrl, loadCharacterRaffleInformation } from './msuApi.js';
import { NON_BOSS_LAYER_IDS } from '../config/nonBossLayerIds.js';
import { LAYER_ID_TO_BOSS_NAME } from '../config/layerIdToBossName.js';

const DAILY_TASK_LABELS = ['Daily Quest', 'Dungeon Clear', 'Guild Donation', 'Pet Feed', 'Ride Check'];
const debugJsonElement = document.querySelector('#debug-json');
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loading-indicator';
loadingIndicator.className = 'loading-indicator';
loadingIndicator.setAttribute('aria-live', 'polite');
loadingIndicator.innerHTML = '<span class="loading-spinner"></span><span>読み込み中</span>';
loadingIndicator.style.display = 'none';
document.body.appendChild(loadingIndicator);
var bossCount = 0;


function showLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
}

function hideLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

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
const WEEKLY_BOSS_SETTINGS_KEY = 'weekly-boss-settings';
const ALL_BOSS_NAMES = [...new Set(Object.values(LAYER_ID_TO_BOSS_NAME))];
let weeklyConfigMode = false;
let weeklyEntries = [];
let weeklyBossSettings = null;

function getWeeklyBossSettings() {
  try {
    const rawSettings = sessionStorage.getItem(WEEKLY_BOSS_SETTINGS_KEY);
    const settings = rawSettings ? JSON.parse(rawSettings) : {};
    return settings && typeof settings === 'object' ? settings : {};
  } catch {
    return {};
  }
}

function saveWeeklyBossSettings(settings) {
  try {
    sessionStorage.setItem(WEEKLY_BOSS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save Weekly Boss settings:', error);
  }
}

function getHiddenBossNames(character) {
  const hiddenBossNames = (weeklyBossSettings ?? getWeeklyBossSettings())[character];
  return Array.isArray(hiddenBossNames) ? hiddenBossNames : [];
}

function renderWeeklyConfigButton() {
  const button = document.querySelector('#weekly-config-button');
  if (!button) return;

  button.innerHTML = weeklyConfigMode ? '&#128190;' : '&#9881;';
  button.setAttribute('aria-label', weeklyConfigMode ? 'Weekly Boss設定を保存' : 'Weekly Boss設定を開く');
  button.title = weeklyConfigMode ? 'Weekly Boss設定を保存' : 'Weekly Boss設定を開く';
}

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
  const rows = entries.length > 0
    ? entries
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
        .join('')
    : '<tr><td colspan="7"></td></tr>';

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

  showLoadingIndicator();
  renderDailyTable([]);
  try {
    const characterRows = await loadCharacterRows();
    renderDailyTable(characterRows);
  } finally {
    hideLoadingIndicator();
  }
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

function getRaffleInformations(rafflePayload) {
  const informations = rafflePayload?.data?.informations ?? rafflePayload?.informations ?? [];
  return Array.isArray(informations) ? informations : [];
}

function renderWeeklyTable(entries = []) {
  const container = document.querySelector('#weekly-board');
  if (!container) return;

  const rowsMarkup = entries
    .map((entry) => {
      const iconMarkup = entry.icon
        ? `<img class="char-icon-img" src="${entry.icon}" alt="${entry.character}" />`
        : `<span class="char-icon">🧙</span>`;

      const hiddenBossNames = getHiddenBossNames(entry.character);
      const bossNames = weeklyConfigMode
        ? ALL_BOSS_NAMES
        : ALL_BOSS_NAMES.filter((bossName) => !hiddenBossNames.includes(bossName));
      const bossMarkup = weeklyConfigMode
        ? `<span class="boss-name-pill">${bossNames.map((bossName) => {
              const isHidden = hiddenBossNames.includes(bossName);
            const isDefeated = entry.bossNames?.includes(bossName);
            const stateClass = `${isHidden ? ' is-hidden' : ''}${isDefeated ? ' is-defeated' : ''}`;
            return `<button class="boss-name-chip${stateClass}" type="button" data-character="${entry.character}" data-boss-name="${bossName}">${bossName}</button>`;
            }).join('')}</span>`
        : entry.loading
          ? '<span class="boss-name-pill loading-boss-pill">取得中</span>'
          : entry.failed
            ? '<span class="boss-name-pill failed-boss-pill">取得失敗</span>'
            : bossNames.length > 0
              ? `<span class="boss-name-pill">${bossNames.map((bossName) => {
                  const stateClass = entry.bossNames?.includes(bossName) ? ' is-defeated' : '';
                  return `<button class="boss-name-chip${stateClass}" type="button" disabled>${bossName}</button>`;
                }).join('')}</span>`
              : '<span class="boss-name-pill">-</span>';

      return `
        <tr>
          <td>
            <div class="char-cell">
              ${iconMarkup}
              <div>
                <div class="char-name">${entry.character}</div>
                <div class="char-meta">Lv. ${entry.level}${entry.job ? ` · ${entry.job}` : ''}</div>
                ${weeklyConfigMode ? `
                  <div class="weekly-bulk-controls">
                    <button class="weekly-bulk-button" type="button" data-character="${entry.character}" data-bulk-action="toggle-all" aria-label="${hiddenBossNames.length === 0 ? '全てチェック解除' : '全てチェック'}" aria-pressed="${hiddenBossNames.length === 0}" title="${hiddenBossNames.length === 0 ? '全てチェック解除' : '全てチェック'}">
                      ${hiddenBossNames.length === 0 ? '&#9745;' : '&#9744;'}
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
          </td>
          <td>${bossMarkup}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="weekly-character-table-wrap">
      <table class="weekly-character-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>${rowsMarkup}</tbody>
      </table>
    </div>
  `;
  renderWeeklyConfigButton();
}

async function renderWeeklyRewards() {
  const container = document.querySelector('#weekly-board');
  if (!container) return;

  showLoadingIndicator();
  bossCount = 0;
  const walletAddress = getWalletAddressFromUrl();
  try {
    const characterRows = await loadCharacterRows();
    const selectedCharacters = characterRows.slice(0, 15); // 上位15キャラクターを選択
    weeklyEntries = selectedCharacters.map((entry) => ({
      ...entry,
      loading: true,
      bossNames: []
    }));

    renderWeeklyTable(weeklyEntries);

    for (const [index, entry] of selectedCharacters.entries()) {
      try {
        const characterAssetKey = entry.assetKey || entry.data?.assetKey || '';
        const rafflePayload = characterAssetKey
          ? await loadCharacterRaffleInformation(characterAssetKey, walletAddress)
          : null;

        const bossNames = getRaffleInformations(rafflePayload)
          .map((information) => information?.layerId)
          .filter(Boolean)
          .map((layerId) => String(layerId))
          .filter((layerId) => !NON_BOSS_LAYER_IDS.includes(layerId))
          .map((layerId) => LAYER_ID_TO_BOSS_NAME[layerId] || layerId);
        
        bossCount += bossNames.length;
        console.log(`Character: ${entry.character}, Bosses: ${bossNames.join(', ')}, Total Boss Count: ${bossCount}`);

        weeklyEntries[index] = {
          ...entry,
          loading: false,
          failed: false,
          bossNames
        };
      } catch (error) {
        console.error('Weekly reward fetch failed:', error);
        weeklyEntries[index] = {
          ...entry,
          loading: false,
          failed: true,
          bossNames: []
        };
      }

      renderWeeklyTable(weeklyEntries);
      renderBossProgress(bossCount);
    }
  } finally {
    hideLoadingIndicator();
  }
}

function toggleWeeklyBossConfig() {
  if (!weeklyConfigMode) {
    weeklyBossSettings = getWeeklyBossSettings();
    weeklyConfigMode = true;
    renderWeeklyTable(weeklyEntries);
    return;
  }

  saveWeeklyBossSettings(weeklyBossSettings);
  weeklyConfigMode = false;
  renderWeeklyTable(weeklyEntries);
}

function setupWeeklyBossControls() {
  document.querySelector('#weekly-config-button')?.addEventListener('click', toggleWeeklyBossConfig);
  document.querySelector('#weekly-board')?.addEventListener('click', (event) => {
    const bulkButton = event.target.closest('.weekly-bulk-button');
    if (bulkButton && weeklyConfigMode) {
      const character = bulkButton.dataset.character;
      const allBossesChecked = getHiddenBossNames(character).length === 0;
      weeklyBossSettings[character] = allBossesChecked ? [...ALL_BOSS_NAMES] : [];
      renderWeeklyTable(weeklyEntries);
      return;
    }

    const chip = event.target.closest('.boss-name-chip');
    if (!chip || !weeklyConfigMode) return;

    const character = chip.dataset.character;
    const bossName = chip.dataset.bossName;
    const hiddenBossNames = new Set(getHiddenBossNames(character));
    if (hiddenBossNames.has(bossName)) {
      hiddenBossNames.delete(bossName);
    } else {
      hiddenBossNames.add(bossName);
    }
    weeklyBossSettings[character] = [...hiddenBossNames];
    renderWeeklyTable(weeklyEntries);
  });
}

async function renderBossProgress(bossCount) {
    const container = document.querySelector('#boss-progress');
  if (!container) return;

  container.innerHTML = `<strong>${bossCount} / 90</strong>`;


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
setupWeeklyBossControls();
