import { DEFAULT_WALLET_ADDRESS, MSU_API_BASE_URL, MSU_API_KEY } from '../config/msuConfig.js';

const CACHE_DIR = 'msu_cache';
const CHARACTERS_DIR = `${CACHE_DIR}/characters`;
const RAFFLE_INFO_DIR = `${CACHE_DIR}/raffle_info`;
const RAFFLE_HISTORY_DIR = `${CACHE_DIR}/raffle_history`;
const CACHE_FILE_NAME = 'characters.json';
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_INTERVAL_MS = 500;
const RATE_LIMIT_RPS = 2;

let requestQueue = Promise.resolve();
let lastRequestAt = 0;

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

function getCacheFilePath(fileName) {
  return `${CACHE_DIR}/${fileName}`;
}

function getLocalStorageCacheKey(walletAddress) {
  return `msu_cache/characters/${walletAddress}/characters.json`;
}

function getCacheDirectoryPath(directoryName) {
  return `${CACHE_DIR}/${directoryName}`;
}

function readCacheFile(filePath) {
  try {
    const raw = localStorage.getItem(filePath);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to read cache file:', error);
    return null;
  }
}

function writeCacheFile(filePath, payload) {
  localStorage.setItem(filePath, JSON.stringify(payload));
}

async function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, { retryCount = RETRY_COUNT, retryDelayMs = RETRY_DELAY_MS } = {}) {
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
}

async function fetchCharacterListFromApi(walletAddress) {
  const url = `${MSU_API_BASE_URL}/accounts/${encodeURIComponent(walletAddress)}/characters`;
  const headers = {
    'Content-Type': 'application/json',
    'x-nxopen-api-key': MSU_API_KEY
  };

  const payload = await fetchWithRetry(url, { headers });
  return payload;
}

async function loadCharacters(walletAddress) {
  const cacheKey = getLocalStorageCacheKey(walletAddress);
  const cached = readCacheFile(cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await fetchCharacterListFromApi(walletAddress);
  writeCacheFile(cacheKey, payload);
  return payload;
}

async function fetchCharacterList(walletAddress = getWalletAddressFromUrl()) {
  const payload = await loadCharacters(walletAddress);
  return normalizeCharacterEntries(payload);
}

export {
  DEFAULT_WALLET_ADDRESS,
  getWalletAddressFromUrl,
  fetchCharacterList,
  normalizeCharacterEntries,
  getCacheDirectoryPath,
  getCacheFilePath,
  getLocalStorageCacheKey,
  fetchCharacterListFromApi,
  loadCharacters,
  CACHE_FILE_NAME,
  CHARACTERS_DIR,
  RAFFLE_INFO_DIR,
  RAFFLE_HISTORY_DIR
};
