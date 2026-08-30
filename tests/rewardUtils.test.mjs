import test from 'node:test';
import assert from 'node:assert/strict';

import { getTotalWinCountByItemId } from '../src/rewardUtils.js';

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
