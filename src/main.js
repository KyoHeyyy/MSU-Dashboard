import {
  fetchCharacterList,
  getWalletAddressFromUrl,
  loadCharacterRaffleHistory,
  loadCharacterRaffleInformation
} from './msuApi.js';
import { getTotalWinCountByItemId } from './rewardUtils.js';
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

// const EVENT_API_URL = 'https://msu.io/maplestoryn/api/community/board/5289/threadsV2?blockStartKey=253402300799%2C9223372036854775807&blockStartNo=1&blockSize=15&pageNo=1&pageSize=15&paginationType=PAGING&searchKeywordType=THREAD_TITLE_AND_CONTENT&headlineId=3296';
// const EVENT_API_KEY = '8484d734-fc72-5bb4-96a4-5622025f2840';
const WEEKLY_BOSS_SETTINGS_KEY = 'weekly-boss-settings';
const ALL_BOSS_NAMES = [...new Set(Object.values(LAYER_ID_TO_BOSS_NAME))];
const DEBUG_CHARACTER_ASSET_KEY = 'CHARd0j2orbfpavs73dqduu0';
const THURSDAY_UTC = 4;
let weeklyConfigMode = false;
let weeklyEntries = [];
let weeklyBossSettings = null;
let rewardEntries = [];
let selectedRewardWeek = 1;

function getLatestThursdayAtUtc(date = new Date()) {
  const latestThursday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const daysSinceThursday = (latestThursday.getUTCDay() + 7 - THURSDAY_UTC) % 7;
  latestThursday.setUTCDate(latestThursday.getUTCDate() - daysSinceThursday);
  return latestThursday.toISOString().replace('.000Z', 'Z');
}

const DEBUG_RAFFLED_AT = getLatestThursdayAtUtc();

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

function getRaffleHistories(rafflePayload) {
  const histories = rafflePayload?.data?.histories ?? rafflePayload?.histories ?? [];
  return Array.isArray(histories) ? histories : [];
}

function getRewardRaffledAt(weeksAgo) {
  const raffledAt = new Date(DEBUG_RAFFLED_AT);
  raffledAt.setUTCDate(raffledAt.getUTCDate() - (weeksAgo - 1) * 7);
  return raffledAt.toISOString().replace('.000Z', 'Z');
}

function getNesoFromHistory(rafflePayload, weeksAgo = selectedRewardWeek) {
  const targetRaffledAt = getRewardRaffledAt(weeksAgo);
  return getTotalWinCountByItemId(rafflePayload, 1, targetRaffledAt);
}

function getPowerCrystalFromHistory(rafflePayload, weeksAgo = selectedRewardWeek) {
  const targetRaffledAt = getRewardRaffledAt(weeksAgo);
  return getTotalWinCountByItemId(rafflePayload, 1000, targetRaffledAt);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getPrizeSummary(history) {
  return (history.prizes ?? [])
    .map((prize) => {
      const key = prize.rewardKey ?? {};
      const winCount = prize.winCount?.value ?? '-';
      const receivedCount = prize.receivedCount?.value ?? '-';
      return `idx=${key.idx ?? '-'}, itemId=${key.itemId ?? '-'}, rotationId=${key.rotationId ?? '-'} (win: ${winCount}, received: ${receivedCount})`;
    })
    .join('\n');
}

function renderRewardDebugTable(histories = [], errorMessage = '') {
  const container = document.querySelector('#reward-debug-board');
  if (!container) return;

  if (errorMessage) {
    container.innerHTML = `<p class="debug-empty reward-failed">${escapeHtml(errorMessage)}</p>`;
    return;
  }

  const rows = histories.length > 0
    ? histories.map((history) => `
        <tr>
          <td>${escapeHtml(history.raffledAt)}</td>
          <td>${escapeHtml(history.layerId)}</td>
          <td>${escapeHtml(history.state)}</td>
          <td>${escapeHtml(history.claimStartAt)}</td>
          <td>${escapeHtml(history.expireAt)}</td>
          <td>${escapeHtml(history.clearInformations?.length ?? 0)}</td>
          <td><pre class="reward-prize-summary">${escapeHtml(getPrizeSummary(history))}</pre></td>
        </tr>
      `).join('')
    : '<tr><td colspan="7" class="debug-empty">該当する履歴はありません</td></tr>';

  container.innerHTML = `
    <div class="debug-table-meta">${escapeHtml(DEBUG_CHARACTER_ASSET_KEY)} / ${escapeHtml(DEBUG_RAFFLED_AT)}</div>
    <div class="debug-table-wrap">
      <table class="debug-table">
        <thead><tr><th>raffledAt</th><th>layerId</th><th>state</th><th>claimStartAt</th><th>expireAt</th><th>clearInformations</th><th>prizes</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

async function renderRewardDebug() {
  renderRewardDebugTable();
  try {
    const walletAddress = getWalletAddressFromUrl();
    const payload = await loadCharacterRaffleHistory(
      DEBUG_CHARACTER_ASSET_KEY,
      walletAddress,
      DEBUG_RAFFLED_AT
    );
    const histories = getRaffleHistories(payload).filter(
      (history) => history?.raffledAt === DEBUG_RAFFLED_AT
    );
    renderRewardDebugTable(histories);
  } catch (error) {
    console.error('Reward debug fetch failed:', error);
    renderRewardDebugTable([], error instanceof Error ? error.message : String(error));
  }
}

function formatNeso(amount) {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1).replace('.0', '')}g`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1).replace('.0', '')}m`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1).replace('.0', '')}k`;
  return String(amount);
}

function getRewardsForWeek(rafflePayload, characterIndex = 0, weeksAgo = selectedRewardWeek) {
  return {
    neso: getNesoFromHistory(rafflePayload, weeksAgo),
    powerCrystal: getPowerCrystalFromHistory(rafflePayload, weeksAgo),
    nfts: [{ name: 'TBD' }],
    fts: [{ icon: 'TBD', quantity: 1 }]
  };
}

function renderRewardTable(entries = []) {
  const container = document.querySelector('#reward-board');
  const totalElement = document.querySelector('#neso-total');
  if (!container || !totalElement) return;

  const totalNeso = entries.reduce((sum, entry, index) => {
    const rewards = entry.rewardsByWeek?.[selectedRewardWeek] ?? getRewardsForWeek(entry.rafflePayload, index);
    return sum + (rewards?.neso ?? 0);
  }, 0);
  totalElement.textContent = formatNeso(totalNeso);
  const rowsMarkup = entries.map((entry, index) => {
    const rewards = entry.rewardsByWeek?.[selectedRewardWeek] ?? getRewardsForWeek(entry.rafflePayload, index);
    const iconMarkup = entry.icon
      ? `<img class="char-icon-img" src="${entry.icon}" alt="${entry.character}" />`
      : `<span class="char-icon">🧙</span>`;
    const loadingMarkup = '<span class="reward-muted">取得中</span>';
    const nesoMarkup = entry.loading ? loadingMarkup : entry.failed ? '<span class="reward-muted reward-failed">取得失敗</span>' : `<span class="reward-value neso-value">${formatNeso(rewards.neso)}</span>`;
    const powerCrystalMarkup = entry.loading ? loadingMarkup : entry.failed ? '<span class="reward-muted reward-failed">取得失敗</span>' : `<span class="reward-value power-crystal-value">${formatNeso(rewards.powerCrystal)}</span>`;
    const nftMarkup = entry.loading ? loadingMarkup : entry.failed ? '-' : '<span class="reward-muted">TBD</span>';
    const ftMarkup = entry.loading ? loadingMarkup : entry.failed ? '-' : '<span class="reward-muted">TBD</span>';
    return `<tr><td><div class="char-cell">${iconMarkup}<div><div class="char-name">${entry.character}</div><div class="char-meta">Lv. ${entry.level}${entry.job ? ` · ${entry.job}` : ''}</div></div></div></td><td>${nesoMarkup}</td><td>${powerCrystalMarkup}</td><td>${nftMarkup}</td><td>${ftMarkup}</td></tr>`;
  }).join('');

  container.innerHTML = `<div class="weekly-character-table-wrap"><table class="weekly-character-table reward-table"><thead><tr><th>Character</th><th>NESO</th><th>Power Crystal</th><th>NFT</th><th>FT</th></tr></thead><tbody>${rowsMarkup}</tbody></table></div>`;
}

async function renderRewards() {
  const container = document.querySelector('#reward-board');
  if (!container) return;
  showLoadingIndicator();
  renderRewardDebug();
  try {
    const characterRows = (await loadCharacterRows()).slice(0, 11);
    rewardEntries = characterRows.map((entry) => ({ ...entry, loading: true }));
    renderRewardTable(rewardEntries);
    const walletAddress = getWalletAddressFromUrl();
    for (const [index, entry] of characterRows.entries()) {
      try {
        const payloadsByWeek = Object.fromEntries(
          await Promise.all(
            [1, 2, 3].map(async (weeksAgo) => [
              weeksAgo,
              entry.assetKey
                ? await loadCharacterRaffleHistory(
                    entry.assetKey,
                    walletAddress,
                    getRewardRaffledAt(weeksAgo)
                  )
                : null
            ])
          )
        );
        const rewardsByWeek = Object.fromEntries(
          [1, 2, 3].map((weeksAgo) => [
            weeksAgo,
            getRewardsForWeek(payloadsByWeek[weeksAgo], index, weeksAgo)
          ])
        );
        rewardEntries[index] = {
          ...entry,
          rafflePayload: payloadsByWeek[1],
          rewardsByWeek,
          loading: false
        };
      } catch (error) {
        console.error('Reward fetch failed:', error);
        rewardEntries[index] = { ...entry, loading: false, failed: true };
      }
      renderRewardTable(rewardEntries);
    }
  } finally {
    hideLoadingIndicator();
  }
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
    const selectedCharacters = characterRows.slice(0, 11); // 上位キャラクターを選択
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
  document.querySelectorAll('.tab-button').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll('.tab-button').forEach((tab) => {
    const isActive = tab.dataset.view === viewName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll('.view-panel').forEach((view) => {
    view.classList.toggle('active', view.dataset.view === viewName);
  });
  if (viewName === 'reward' && rewardEntries.length === 0) renderRewards();
}

renderDaily();
renderBoss();
renderWeeklyRewards();
setupTabs();
setupWeeklyBossControls();
document.querySelector('#weekly-reward-button')?.addEventListener('click', () => switchView('reward'));
document.querySelectorAll('.reward-week-button').forEach((button) => {
  button.addEventListener('click', () => {
    selectedRewardWeek = Number(button.dataset.rewardWeek);
    document.querySelectorAll('.reward-week-button').forEach((weekButton) => {
      const isSelected = Number(weekButton.dataset.rewardWeek) === selectedRewardWeek;
      weekButton.classList.toggle('active', isSelected);
      weekButton.setAttribute('aria-pressed', String(isSelected));
    });
    renderRewardTable(rewardEntries);
  });
});
