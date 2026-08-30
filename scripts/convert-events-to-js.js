#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'data', 'api-response', 'events.json');
const targetPath = path.join(projectRoot, 'public', 'data', 'events.js');

async function main() {
  const raw = await readFile(sourcePath, 'utf8');
  const data = JSON.parse(raw);

  await mkdir(path.dirname(targetPath), { recursive: true });

  const jsContent = `window.MSU_EVENTS = ${JSON.stringify(data, null, 2)};\n`;
  await writeFile(targetPath, jsContent, 'utf8');

  console.log(`Converted ${sourcePath} -> ${targetPath}`);
}

main().catch((error) => {
  console.error('Failed to convert events.json:', error);
  process.exit(1);
});
