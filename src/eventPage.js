function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderEventPayload(payload) {
  const container = document.querySelector('#event-board');
  if (!container) return;

  const prettyJson = JSON.stringify(payload, null, 2);
  container.innerHTML = `<pre class="debug-json-output">${escapeHtml(prettyJson)}</pre>`;
}

function loadLocalEvents() {
  const data = typeof window !== 'undefined' ? (window.MSU_EVENTS ?? globalThis.MSU_EVENTS ?? null) : null;
  if (!data || !Array.isArray(data.threads)) {
    throw new Error('Local event data is missing.');
  }
  return data;
}

async function initEventPage() {
  try {
    const payload = loadLocalEvents();
    renderEventPayload(payload);
  } catch (error) {
    const container = document.querySelector('#event-board');
    if (!container) return;
    container.innerHTML = `<p class="debug-empty reward-failed">${escapeHtml(error instanceof Error ? error.message : String(error))}</p>`;
  }
}

initEventPage();
