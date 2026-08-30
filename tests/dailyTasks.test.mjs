import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDailyResetDateKey,
  getNormalizedDailyTaskConfig,
  getDailyViewModel,
  getDailyTaskVisibility,
  toggleDailyTaskVisibility
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
