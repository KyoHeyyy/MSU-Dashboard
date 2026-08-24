import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clearExpiredCache,
  getCache,
  getWalletAddressFromUrl,
  getNextThursdayAtUtc,
  normalizeCharacterEntries,
  setCache
} from '../src/msuApi.js';

class SessionStorageMock {
  #items = new Map();

  get length() {
    return this.#items.size;
  }

  key(index) {
    return [...this.#items.keys()][index] ?? null;
  }

  getItem(key) {
    return this.#items.get(key) ?? null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }

  removeItem(key) {
    this.#items.delete(key);
  }
}

test('getWalletAddressFromUrl returns URL param or fallback value', () => {
  assert.equal(getWalletAddressFromUrl('?walletAddress=0xabc123'), '0xabc123');
  assert.equal(getWalletAddressFromUrl('?address=0xdef456'), '0xdef456');
  assert.equal(getWalletAddressFromUrl(''), '0x24eb476d0E7B9d2099323E633FF0f16f5A64c067');
});

test('getNextThursdayAtUtc returns the following Thursday at 00:00 UTC', () => {
  assert.equal(
    new Date(getNextThursdayAtUtc(Date.parse('2026-08-24T12:00:00Z'))).toISOString(),
    '2026-08-27T00:00:00.000Z'
  );
  assert.equal(
    new Date(getNextThursdayAtUtc(Date.parse('2026-08-27T00:00:00Z'))).toISOString(),
    '2026-09-03T00:00:00.000Z'
  );
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

test('cache uses sessionStorage and removes expired or invalid entries', () => {
  const storage = new SessionStorageMock();
  globalThis.sessionStorage = storage;

  setCache('characters:test', { id: 1 });
  const stored = JSON.parse(storage.getItem('cache:characters:test'));

  assert.deepEqual(getCache('characters:test'), { id: 1 });
  assert.equal(stored.createdAt <= stored.expiresAt, true);

  storage.setItem(
    'cache:expired',
    JSON.stringify({ value: 'old', expiresAt: Date.now() - 1 })
  );
  storage.setItem('cache:invalid', '{invalid');
  storage.setItem('other-data', 'keep');

  clearExpiredCache();

  assert.equal(storage.getItem('cache:expired'), null);
  assert.equal(storage.getItem('cache:invalid'), null);
  assert.equal(storage.getItem('other-data'), 'keep');
});
