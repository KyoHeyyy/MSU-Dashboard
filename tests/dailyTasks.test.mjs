import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDailyResetDateKey,
  getNormalizedDailyTaskConfig,
  getDailyViewModel,
  getDailyTaskVisibility,
  getDailyResetMode,
  setDailyResetMode,
  clearDailyProgressForDate,
  toggleDailyTaskVisibility,
  getWeeklyResetDateKey,
  getWeeklyResetMode,
  setWeeklyResetMode,
  clearWeeklyProgressForDate
} from '../src/dailyTasks.js';

test('JST 09:00 reset splits the day correctly', () => {
  assert.equal(getDailyResetDateKey(new Date('2026-08-30T08:59:00+09:00')), '2026-08-29');
  assert.equal(getDailyResetDateKey(new Date('2026-08-30T09:00:00+09:00')), '2026-08-30');
});

test('default daily config includes task groups and default tasks', () => {
  const config = getNormalizedDailyTaskConfig();
  assert.ok(config.groups.length >= 3);
  assert.ok(config.tasks.some((task) => task.groupId === 'symbol' && task.type === 'default'));
  assert.ok(config.assignments.some((assignment) => assignment.taskId === 'symbol-daily' && assignment.characterId === 'all'));
});

test('daily view model maps default tasks to each character', () => {
  const config = getNormalizedDailyTaskConfig();
  const viewModel = getDailyViewModel([
    { character: 'Alpha', assetKey: 'a' },
    { character: 'Bravo', assetKey: 'b' }
  ], config);

  assert.equal(viewModel.groups[0].id, 'symbol');
  assert.equal(viewModel.entries.length, 0);

  toggleDailyTaskVisibility({ characterId: 'a', taskId: 'symbol-daily', visible: true });
  toggleDailyTaskVisibility({ characterId: 'b', taskId: 'symbol-daily', visible: true });

  const visibleView = getDailyViewModel([
    { character: 'Alpha', assetKey: 'a' },
    { character: 'Bravo', assetKey: 'b' }
  ], config);
  assert.ok(visibleView.entries[0].tasks.some((task) => task.taskId === 'symbol-daily'));
  assert.ok(visibleView.entries[1].tasks.some((task) => task.taskId === 'symbol-daily'));
});

test('daily task visibility can hide a task for a specific character', () => {
  const visibility = getDailyTaskVisibility('a', 'monster-park');
  assert.equal(visibility, false);

  toggleDailyTaskVisibility({ characterId: 'a', taskId: 'monster-park', visible: true });
  assert.equal(getDailyTaskVisibility('a', 'monster-park'), true);

  const visibleView = getDailyViewModel(
    [{ character: 'Alpha', assetKey: 'a' }],
    getNormalizedDailyTaskConfig(),
    {},
    { includeHidden: false }
  );
  assert.ok(visibleView.entries[0].tasks.some((task) => task.taskId === 'monster-park'));

  toggleDailyTaskVisibility({ characterId: 'a', taskId: 'monster-park', visible: false });
  assert.equal(getDailyTaskVisibility('a', 'monster-park'), false);
});

test('daily reset mode supports manual clear and auto reset mode', () => {
  setDailyResetMode('manual');
  assert.equal(getDailyResetMode(), 'manual');

  const dateKey = getDailyResetDateKey();
  const progressMap = {
    'a:symbol-daily': true,
    'a:monster-park': true,
    'b:daily-quest': true
  };

  clearDailyProgressForDate(dateKey, progressMap);
  assert.deepEqual(clearDailyProgressForDate(dateKey, progressMap), {
    'a:symbol-daily': false,
    'a:monster-park': false,
    'b:daily-quest': false
  });

  setDailyResetMode('auto');
  assert.equal(getDailyResetMode(), 'auto');
});

test('weekly reset key follows Thursday 09:00 JST boundary', () => {
  assert.equal(getWeeklyResetDateKey(new Date('2026-08-27T08:59:00+09:00')), '2026-08-20');
  assert.equal(getWeeklyResetDateKey(new Date('2026-08-27T09:00:00+09:00')), '2026-08-27');

  setWeeklyResetMode('manual');
  assert.equal(getWeeklyResetMode(), 'manual');

  const doneMap = {
    'a:vanishing-journey-daily': true,
    'b:chuchu-daily': true
  };
  assert.deepEqual(clearWeeklyProgressForDate('2026-08-27', doneMap), {
    'a:vanishing-journey-daily': false,
    'b:chuchu-daily': false
  });

  setWeeklyResetMode('auto');
  assert.equal(getWeeklyResetMode(), 'auto');
});
