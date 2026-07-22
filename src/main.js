const WALLET_URL = '/navigator/api/navigator/inventory/0x24eb476d0E7B9d2099323E633FF0f16f5A64c067/characters-v2?size=42';
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

const weeklyRewardData = [
  {
    walletId: 'xxxxxxxx',
    account: 'Account 01',
    characters: [
      { name: 'キャラA', reward: 'Legendary Chest' },
      { name: 'キャラB', reward: 'Epic Chest' },
      { name: 'キャラC', reward: 'Rare Chest' }
    ]
  }
];

function setDebugJson(message) {
  if (!debugJsonElement) return;
  debugJsonElement.textContent = message;
}

function formatDebugJson(message) {
  return typeof message === 'string' ? message : JSON.stringify(message, null, 2);
}

async function fetchCharacterList() {
  try {
    const response = await fetch(WALLET_URL);
    const rawText = await response.text();
    setDebugJson(`status: ${response.status}\n\n${formatDebugJson(rawText).slice(0, 4000)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = JSON.parse(rawText);
    const characters = data?.characters ?? [];

    return characters
      .map((entry) => ({
        icon: entry.character?.imageUrl ?? '',
        character: entry.character?.name ?? 'Unknown',
        level: entry.character?.level ?? 0,
        job: entry.character?.job?.jobName ?? '',
        linkBuff: true,
        tasks: DAILY_TASK_LABELS.map((label, index) => ({
          label,
          done: index % 2 === 0,
          type: index % 2 === 0 ? 'checkbox' : 'toggle'
        }))
      }))
      .sort((a, b) => b.level - a.level);
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
  const characterRows = await fetchCharacterList();
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

function renderWeeklyRewards() {
  const container = document.querySelector('#weekly-board');
  if (!container) return;

  container.innerHTML = weeklyRewardData
    .map(
      (account) => `
        <article class="info-card">
          <div class="card-title-row">
            <h3>${account.account}</h3>
            <span class="count-badge">wallet: ${account.walletId}</span>
          </div>
          <ul class="reward-list">
            ${account.characters
              .map(
                (char) => `
                  <li>
                    <strong>${char.name}</strong>
                    <span>${char.reward}</span>
                  </li>
                `
              )
              .join('')}
          </ul>
        </article>
      `
    )
    .join('');
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
