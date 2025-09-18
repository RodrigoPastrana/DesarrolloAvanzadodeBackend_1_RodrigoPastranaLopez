import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const resolveDataPath = (relative) =>
  path.join(rootDir, 'data', relative);

export async function readJSON(file) {
  const p = resolveDataPath(file);
  try {
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function writeJSON(file, data) {
  const p = resolveDataPath(file);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

