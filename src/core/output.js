import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(outDir) {
  await fs.mkdir(outDir, { recursive: true });
}

export async function writeJson(outDir, fileName, data) {
  await ensureDir(outDir);
  const p = path.join(outDir, fileName);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
  return p;
}

export async function writeMd(outDir, fileName, markdown) {
  await ensureDir(outDir);
  const p = path.join(outDir, fileName);
  await fs.writeFile(p, markdown, 'utf8');
  return p;
}
