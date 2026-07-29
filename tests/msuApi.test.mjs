import test from 'node:test';
import assert from 'node:assert/strict';

import { getWalletAddressFromUrl, normalizeCharacterEntries } from '../src/msuApi.js';

test('getWalletAddressFromUrl returns URL param or fallback value', () => {
  assert.equal(getWalletAddressFromUrl('?walletAddress=0xabc123'), '0xabc123');
  assert.equal(getWalletAddressFromUrl('?address=0xdef456'), '0xdef456');
  assert.equal(getWalletAddressFromUrl(''), '0x24eb476d0E7B9d2099323E633FF0f16f5A64c067');
});

test('normalizeCharacterEntries handles raw and nested character payloads', () => {
  const payload = {
    characters: [
      {
        character: {
          name: 'TestChar',
          level: 200,
          imageUrl: 'https://example.com/test.png',
          job: { jobName: 'Warrior' }
        }
      }
    ]
  };

  const entries = normalizeCharacterEntries(payload);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].character, 'TestChar');
  assert.equal(entries[0].level, 200);
  assert.equal(entries[0].job, 'Warrior');
});
