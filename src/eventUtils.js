function normalizeDate(value) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00Z`);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseEventDateRange(tags = []) {
  const values = Array.isArray(tags) ? tags : [];
  const startValue = values[0];
  const endValue = values[1] ?? values[0];

  const start = normalizeDate(startValue);
  const end = normalizeDate(endValue);

  if (!start || !end) {
    return { start: null, end: null };
  }

  return {
    start,
    end: end.getTime() >= start.getTime() ? end : start
  };
}

export function buildEventTimeline(events = []) {
  const normalized = (Array.isArray(events) ? events : [])
    .map((event) => {
      const { start, end } = parseEventDateRange(event?.tags ?? []);
      const title = event?.title ?? 'Untitled Event';

      if (!start || !end) {
        return null;
      }

      return {
        title,
        start,
        end,
        durationDays: Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1),
        startLabel: start.toISOString().slice(0, 10),
        endLabel: end.toISOString().slice(0, 10)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (!normalized.length) {
    return { events: [], minStart: null, maxEnd: null };
  }

  const minStart = normalized.reduce((min, event) => {
    return event.start.getTime() < min.getTime() ? event.start : min;
  }, normalized[0].start);

  const maxEnd = normalized.reduce((max, event) => {
    return event.end.getTime() > max.getTime() ? event.end : max;
  }, normalized[0].end);

  return { events: normalized, minStart, maxEnd };
}
