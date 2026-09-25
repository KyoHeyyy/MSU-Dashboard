import test from 'node:test';
import assert from 'node:assert/strict';

import { getTotalWinCountByItemId } from '../src/rewardUtils.js';
import { getBossNamesFromRaffleInformations } from '../src/weeklyBossUtils.js';

test('getTotalWinCountByItemId sums matching itemId prizes for the selected raffledAt', () => {
  const rafflePayload = {
    histories: [
      {
        raffledAt: '2026-08-27T00:00:00Z',
        prizes: [
          { rewardKey: { itemId: 1 }, winCount: { value: 5 } },
          { rewardKey: { itemId: 1000 }, winCount: { value: 7 } },
          { rewardKey: { itemId: 1000 }, winCount: { value: 3 } }
        ]
      },
      {
        raffledAt: '2026-08-20T00:00:00Z',
        prizes: [
          { rewardKey: { itemId: 1000 }, winCount: { value: 99 } }
        ]
      }
    ]
  };

  assert.equal(getTotalWinCountByItemId(rafflePayload, 1000, '2026-08-27T00:00:00Z'), 10);
  assert.equal(getTotalWinCountByItemId(rafflePayload, 1, '2026-08-27T00:00:00Z'), 5);
});

test('getBossNamesFromRaffleInformations ignores unregistered layer IDs and old clears', () => {
  const referenceDate = new Date('2026-07-30T12:00:00Z');

  assert.deepEqual(getBossNamesFromRaffleInformations([
    {
      layerId: '205030',
      clearInformations: [
        { clearedAt: '2026-07-23T13:00:00Z' },
        { clearedAt: '2026-07-30T01:00:00Z' }
      ]
    },
    {
      layerId: '500008',
      clearInformations: [
        { clearedAt: '2026-07-30T05:00:00Z' }
      ]
    },
    {
      layerId: '205031',
      clearInformations: [
        { clearedAt: '2026-07-28T20:00:00Z' }
      ]
    }
  ], referenceDate), ['C.Queen']);
});

test('getBossNamesFromRaffleInformations ignores clearedAt older than the latest Thursday', () => {
  const referenceDate = new Date('2026-07-30T12:00:00Z');

  assert.deepEqual(getBossNamesFromRaffleInformations([
    {
      layerId: 205030,
      clearInformations: [
        { clearedAt: '2026-07-23T13:00:00Z' },
        { clearedAt: '2026-07-28T00:00:00Z' }
      ]
    },
    {
      layerId: 205028,
      clearInformations: [
        { clearedAt: '2026-07-16T07:00:00Z' }
      ]
    },
    {
      layerId: 205031,
      clearInformations: [
        { clearedAt: '2026-07-30T01:00:00Z' }
      ]
    }
  ], referenceDate), ['H.Magnus']);
});
