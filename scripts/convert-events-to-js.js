#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'data', 'api-response', 'events.json');
const targetPath = path.join(projectRoot, 'public', 'data', 'events.js');
const MAX_REASONABLE_YEAR = 2100;

function parseDateValue(value) {
  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  if (!normalized) return null;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  if (year >= MAX_REASONABLE_YEAR || year < 2000) return null;

  return date;
}

function sanitizeThread(thread) {
  if (!thread || typeof thread !== 'object') return null;

  const tags = Array.isArray(thread.tags) ? thread.tags : [];
  const validTags = tags.filter((tag) => parseDateValue(tag) !== null);

  if (validTags.length < 2) {
    return null;
  }

  const startDate = parseDateValue(validTags[0]);
  const endDate = parseDateValue(validTags[1]);

  if (!startDate || !endDate) {
    return null;
  }

  if (endDate.getTime() < startDate.getTime()) {
    return null;
  }

  return {
    ...thread,
    tags: [validTags[0], validTags[1]]
  };
}

async function main() {
  const raw = await readFile(sourcePath, 'utf8');
  const data = JSON.parse(raw);
  const originalThreadCount = Array.isArray(data.threads) ? data.threads.length : 0;
  const sanitizedThreads = Array.isArray(data.threads)
    ? data.threads.map(sanitizeThread).filter(Boolean)
    : [];

  const sanitizedData = {
    ...data,
    threads: sanitizedThreads
  };

  await mkdir(path.dirname(targetPath), { recursive: true });

  const jsContent = `window.MSU_EVENTS = ${JSON.stringify(sanitizedData, null, 2)};\n`;
  await writeFile(targetPath, jsContent, 'utf8');

  console.log(`Converted ${sourcePath} -> ${targetPath}`);
  console.log(`Sanitized event threads: ${originalThreadCount} -> ${sanitizedThreads.length}`);
}

main().catch((error) => {
  console.error('Failed to convert events.json:', error);
  process.exit(1);
});
