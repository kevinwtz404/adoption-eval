import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(outDir: string): Promise<void> {
  await fs.mkdir(outDir, { recursive: true });
}

export async function writeJson(outDir: string, fileName: string, data: unknown): Promise<string> {
  await ensureDir(outDir);
  const p = path.join(outDir, fileName);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
  return p;
}

export async function writeMd(outDir: string, fileName: string, markdown: string): Promise<string> {
  await ensureDir(outDir);
  const p = path.join(outDir, fileName);
  await fs.writeFile(p, markdown, 'utf8');
  return p;
}
