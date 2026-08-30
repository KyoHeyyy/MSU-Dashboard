function getEventThreads() {
  const data = typeof window !== 'undefined' ? (window.MSU_EVENTS ?? globalThis.MSU_EVENTS ?? null) : null;
  if (!data || !Array.isArray(data.threads)) {
    return [];
  }

  return data.threads.filter((event) => Array.isArray(event.tags) && event.tags.length >= 2);
}

function renderSampleGantt() {
  const container = document.querySelector('#event-board');
  if (!container) return;

  const DEV_GANTT_TITLE_WIDTH = 430;
  const DEV_GANTT_DAY_WIDTH = 30;
  const DEV_GANTT_SCROLL_BIAS = 0.55;

  const threads = getEventThreads();
  if (!threads.length) {
    container.innerHTML = '<p class="debug-empty reward-failed">Local event data is missing.</p>';
    return;
  }

  const DAY = 86400000;
  const events = threads
    .map((event) => {
      const start = new Date(event.tags[0]);
      const end = new Date(event.tags[1]);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
      }

      return {
        title: event.title,
        start,
        end,
        thumbnail: event.thumbnailImageUrl,
        url: `https://msu.io/maplestoryn/news/events/${event.threadId}`
      };
    })
    .filter(Boolean);

  if (!events.length) {
    container.innerHTML = '<p class="debug-empty reward-failed">No valid event dates found.</p>';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  const maxDate = new Date(Math.max(...events.map((event) => event.end)));
  minDate.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);

  const totalDays = Math.max(1, Math.floor((maxDate - minDate) / DAY) + 1);
  const todayIndex = 0;

  const gantt = document.createElement('div');
  gantt.id = 'gantt';
  gantt.className = 'sample-gantt';

  const table = document.createElement('table');
  const head = document.createElement('tr');

  const blank = document.createElement('th');
  blank.className = 'title';
  blank.innerHTML = '<b>Event</b>';
  head.appendChild(blank);

  for (let i = 0; i < totalDays; i += 1) {
    const day = new Date(minDate);
    day.setDate(day.getDate() + i);

    const th = document.createElement('th');
    th.className = 'day';

    if (i === todayIndex) {
      th.classList.add('today-line');
      th.classList.add('today-head');
    }

    th.innerHTML = `${day.getMonth() + 1}/${day.getDate()}`;
    head.appendChild(th);
  }

  table.appendChild(head);

  events.forEach((event) => {
    const tr = document.createElement('tr');
    const title = document.createElement('td');
    title.className = 'title';
    title.innerHTML = `
      <div class="event-info">
        <a href="${event.url}" target="_blank" rel="noreferrer noopener">
          <img src="${event.thumbnail}" loading="lazy" alt="${event.title}" />
        </a>
        <a href="${event.url}" target="_blank" rel="noreferrer noopener">
          ${event.title}
        </a>
      </div>
    `;
    tr.appendChild(title);

    for (let i = 0; i < totalDays; i += 1) {
      const td = document.createElement('td');
      td.className = 'bar-cell';

      if (i === todayIndex) {
        td.classList.add('today-line');
      }

      tr.appendChild(td);
    }

    const startOffset = Math.max(0, Math.floor((event.start - minDate) / DAY));
    const endOffset = Math.max(startOffset, Math.floor((event.end - minDate) / DAY));

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.left = `${startOffset * DEV_GANTT_DAY_WIDTH}px`;
    bar.style.width = `${Math.max(DEV_GANTT_DAY_WIDTH, (endOffset - startOffset + 1) * DEV_GANTT_DAY_WIDTH)}px`;
    bar.title = `${event.title}\n${event.start.toLocaleDateString()} ～ ${event.end.toLocaleDateString()}`;

    tr.children[1].appendChild(bar);
    table.appendChild(tr);
  });

  gantt.appendChild(table);
  container.innerHTML = '';
  container.appendChild(gantt);

  requestAnimationFrame(() => {
    const targetX = todayIndex * DEV_GANTT_DAY_WIDTH
      - gantt.clientWidth * DEV_GANTT_SCROLL_BIAS
      + DEV_GANTT_TITLE_WIDTH * 0.65;
    gantt.scrollLeft = Math.max(0, targetX);
  });
}

renderSampleGantt();
