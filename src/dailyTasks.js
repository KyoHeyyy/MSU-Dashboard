const DAILY_TASK_STORAGE_KEY = 'daily-task-progress-v1';
const DAILY_TASK_VISIBILITY_KEY = 'daily-task-visibility-v1';
let dailyVisibilityMemory = {};
const DAILY_TASK_GROUPS = [
  { id: 'symbol', name: 'Symbol', order: 1 },
  { id: 'monster-park', name: 'Monster Park', order: 2 },
  { id: 'event', name: 'Event', order: 3 }
];

const DEFAULT_DAILY_TASKS = [
  { id: 'symbol-daily', name: 'Symbol Daily', icon: '✦', groupId: 'symbol', type: 'default', order: 1 },
  { id: 'monster-park', name: 'Monster Park', icon: '🐾', groupId: 'monster-park', type: 'default', order: 1 },
  { id: 'daily-quest', name: 'Daily Quest', icon: '🧭', groupId: 'event', type: 'default', order: 2 },
  { id: 'dungeon-clear', name: 'Dungeon Clear', icon: '⚔️', groupId: 'event', type: 'default', order: 3 }
];

const DEFAULT_ASSIGNMENTS = [
  { characterId: 'all', taskId: 'symbol-daily' },
  { characterId: 'all', taskId: 'monster-park' },
  { characterId: 'all', taskId: 'daily-quest' },
  { characterId: 'all', taskId: 'dungeon-clear' }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    const raw = window.localStorage.getItem(DAILY_TASK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DAILY_TASK_STORAGE_KEY, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors in non-persistent environments.
  }
}

function getVisibilityStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(DAILY_TASK_VISIBILITY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return dailyVisibilityMemory;
    }
  }

  return dailyVisibilityMemory;
}

function saveVisibilityStorage(storage) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(DAILY_TASK_VISIBILITY_KEY, JSON.stringify(storage));
      return;
    } catch {
      // Fall back to memory state if storage is unavailable.
    }
  }

  dailyVisibilityMemory = storage;
}

export function getDailyResetDateKey(date = new Date()) {
  const jstTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const normalized = new Date(jstTime.getTime());

  if (normalized.getUTCHours() < 9) {
    normalized.setUTCDate(normalized.getUTCDate() - 1);
  }

  normalized.setUTCHours(0, 0, 0, 0);
  return normalized.toISOString().slice(0, 10);
}

export function loadDailyProgressByDate(dateKey = getDailyResetDateKey()) {
  const storage = readStorage();
  const entries = storage?.[dateKey] ?? {};
  return entries && typeof entries === 'object' ? entries : {};
}

export function saveDailyProgressByDate(progressMap, dateKey = getDailyResetDateKey()) {
  const storage = readStorage();
  storage[dateKey] = progressMap && typeof progressMap === 'object' ? progressMap : {};
  writeStorage(storage);
}

export function getDailyTaskVisibility(characterId, taskId) {
  const storage = getVisibilityStorage();
  const key = `${characterId}:${taskId}`;
  return storage[key] === true;
}

export function toggleDailyTaskVisibility({ characterId, taskId, visible }) {
  const storage = getVisibilityStorage();
  const key = `${characterId}:${taskId}`;
  storage[key] = Boolean(visible);
  saveVisibilityStorage(storage);
  return storage;
}

export function toggleDailyTaskCompletion({ characterId, taskId, completed, dateKey = getDailyResetDateKey() }) {
  const progressMap = loadDailyProgressByDate(dateKey);
  const key = `${characterId}:${taskId}`;
  if (completed) {
    progressMap[key] = true;
  } else {
    delete progressMap[key];
  }
  saveDailyProgressByDate(progressMap, dateKey);
  return progressMap;
}

export function getNormalizedDailyTaskConfig() {
  return {
    groups: clone(DAILY_TASK_GROUPS),
    tasks: clone(DEFAULT_DAILY_TASKS),
    assignments: clone(DEFAULT_ASSIGNMENTS)
  };
}

export function getDailyViewModel(
  characters = [],
  config = getNormalizedDailyTaskConfig(),
  progressMap = {},
  options = {}
) {
  const includeHidden = Boolean(options.includeHidden);
  const taskMap = new Map(config.tasks.map((task) => [task.id, task]));
  const assignmentsByCharacter = new Map();

  for (const assignment of config.assignments) {
    const characterIds = assignment.characterId === 'all'
      ? characters.map((character) => character.assetKey || character.character || character.name || 'all')
      : [assignment.characterId];

    for (const characterId of characterIds) {
      if (!assignmentsByCharacter.has(characterId)) {
        assignmentsByCharacter.set(characterId, []);
      }
      const task = taskMap.get(assignment.taskId);
      if (task) {
        assignmentsByCharacter.get(characterId).push(task);
      }
    }
  }

  return {
    groups: config.groups
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    entries: characters
      .map((character) => {
        const characterId = character.assetKey || character.character || character.name || 'all';
        const tasks = (assignmentsByCharacter.get(characterId) ?? [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const mappedTasks = tasks
          .map((task) => ({
            taskId: task.id,
            name: task.name,
            icon: task.icon,
            groupId: task.groupId,
            type: task.type,
            visible: getDailyTaskVisibility(characterId, task.id),
            completed: Boolean(progressMap[`${characterId}:${task.id}`])
          }));

        return {
          characterId,
          character: character.character ?? character.name ?? 'Unknown',
          icon: character.icon ?? character.imageUrl ?? '',
          level: character.level ?? 0,
          job: character.job ?? '',
          tasks: includeHidden ? mappedTasks : mappedTasks.filter((task) => task.visible)
        };
      })
      .filter((entry) => includeHidden || entry.tasks.length > 0)
  };
}
