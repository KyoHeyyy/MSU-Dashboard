import { DEFAULT_WALLET_ADDRESS, MSU_API_BASE_URL, MSU_API_KEY } from '../config/msuConfig.js';

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_INTERVAL_MS = 500;
const RATE_LIMIT_RPS = 2;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let requestQueue = Promise.resolve();
let lastRequestAt = 0;
const characterListCache = new Map();
const raffleInfoCache = new Map();

function getWalletAddressFromUrl(url = window.location.search) {
  if (!url) {
    return DEFAULT_WALLET_ADDRESS;
  }

  const params = new URLSearchParams(url.startsWith('?') ? url.slice(1) : url);
  const walletAddress = params.get('walletAddress') || params.get('address');
  return walletAddress || DEFAULT_WALLET_ADDRESS;
}

function normalizeCharacterEntries(payload) {
  const list =
    payload?.data?.characters ??
    payload?.characters ??
    payload?.data ??
    [];

  return (Array.isArray(list) ? list : []).map((entry) => {
    const characterPayload = entry?.character ?? entry;
    const data = entry?.data ?? characterPayload?.data ?? characterPayload ?? {};
    const name = entry?.name ?? characterPayload?.name ?? 'Unknown';
    const level = data?.level ?? characterPayload?.level ?? entry?.level ?? 0;
    const imageUrl = data?.imageUrl ?? characterPayload?.imageUrl ?? entry?.imageUrl ?? '';
    const job = data?.job?.jobName ?? characterPayload?.job?.jobName ?? entry?.job?.jobName ?? '';

    return {
      ...entry,
      character: name,
      name,
      data,
      level,
      imageUrl,
      job
    };
  });
}

async function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, { retryCount = RETRY_COUNT, retryDelayMs = RETRY_DELAY_MS } = {}) {
  const runFetch = async () => {
    let lastError;
    for (let attempt = 0; attempt < retryCount; attempt += 1) {
      try {
        const now = Date.now();
        const elapsed = now - lastRequestAt;
        if (elapsed < REQUEST_INTERVAL_MS) {
          await wait(REQUEST_INTERVAL_MS - elapsed);
        }

        lastRequestAt = Date.now();
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < retryCount - 1) {
          await wait(retryDelayMs * (attempt + 1));
        }
      }
    }

    throw lastError;
  };

  const currentRequest = requestQueue.then(runFetch, runFetch);
  requestQueue = currentRequest.catch(() => {});
  return currentRequest;
}

async function fetchCharacterListFromApi(walletAddress) {
  const url = `${MSU_API_BASE_URL}/accounts/${encodeURIComponent(walletAddress)}/characters?size=100`;
  const headers = {
    'Content-Type': 'application/json',
    'x-nxopen-api-key': MSU_API_KEY
  };

  const payload = await fetchWithRetry(url, { headers });
  return payload;
}

function getCharacterListCacheKey(walletAddress) {
  return `characters:${walletAddress}`;
}

function getRaffleInfoCacheKey(characterAssetKey, walletAddress) {
  return `raffle:${walletAddress}:${characterAssetKey}`;
}

function getValidCacheEntry(cache, key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

async function loadCharacters(walletAddress) {
  const cacheKey = getCharacterListCacheKey(walletAddress);
  const cached = getValidCacheEntry(characterListCache, cacheKey);
  if (cached !== null) {
    return cached;
  }

  const payload = await fetchCharacterListFromApi(walletAddress);
  characterListCache.set(cacheKey, { value: payload, timestamp: Date.now() });
  return payload;
}

async function fetchCharacterList(walletAddress = getWalletAddressFromUrl()) {
  const payload = await loadCharacters(walletAddress);
  return normalizeCharacterEntries(payload);
}

async function fetchCharacterRaffleInformation(characterAssetKey, walletAddress = getWalletAddressFromUrl()) {
  const url = `${MSU_API_BASE_URL}/msn/characters/${encodeURIComponent(characterAssetKey)}/raffles?walletAddress=${encodeURIComponent(walletAddress)}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-nxopen-api-key': MSU_API_KEY
  };

  return fetchWithRetry(url, { headers });
}

async function loadCharacterRaffleInformation(characterAssetKey, walletAddress = getWalletAddressFromUrl()) {
  const cacheKey = getRaffleInfoCacheKey(characterAssetKey, walletAddress);
  const cached = getValidCacheEntry(raffleInfoCache, cacheKey);
  if (cached !== null) {
    return cached;
  }

  const payload = await fetchCharacterRaffleInformation(characterAssetKey, walletAddress);
  raffleInfoCache.set(cacheKey, { value: payload, timestamp: Date.now() });
  return payload;
}

export {
  DEFAULT_WALLET_ADDRESS,
  getWalletAddressFromUrl,
  fetchCharacterList,
  normalizeCharacterEntries,
  fetchCharacterListFromApi,
  loadCharacters,
  loadCharacterRaffleInformation,
  fetchCharacterRaffleInformation
};
