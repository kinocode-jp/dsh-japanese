// Build polish batches: English + current Japanese for a set of namespaces,
// so a reviewer can return only the strings that need rewording.
// Run: node tools/make-polish.mjs [maxKeysPerBatch] [ns1,ns2,...]
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const limit = Number(process.argv[2] ?? 120);
const names = process.argv[3]
  ? process.argv[3].split(',').map((s) => s.trim()).filter(Boolean)
  : ['sidebar', 'common', 'chat', 'command', 'settings', 'workspace', 'conversation', 'pluginManager', 'trajectory'];

const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const dir = join(root, 'locale', 'ja');
const ja = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  ja[f.slice(0, -5)] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
}

const units = [];
for (const ns of names) {
  if (!baseline[ns]) { console.warn(`skip unknown namespace: ${ns}`); continue; }
  const keys = Object.keys(baseline[ns]).filter((k) => typeof ja[ns]?.[k] === 'string');
  for (let i = 0; i < keys.length; i += limit) units.push({ ns, keys: keys.slice(i, i + limit) });
}

const batchDir = join(root, 'work', 'polish');
const outDir = join(root, 'work', 'polish-out');
for (const d of [batchDir, outDir]) {
  if (existsSync(d)) rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
}

const manifest = [];
let n = 0;
for (const unit of units) {
  const id = String(++n).padStart(3, '0');
  const entries = { [unit.ns]: Object.fromEntries(unit.keys.map((k) => [k, { en: baseline[unit.ns][k], ja: ja[unit.ns][k] }])) };
  writeFileSync(join(batchDir, `polish-${id}.json`), JSON.stringify({ id, entries }, null, 2) + '\n', 'utf8');
  manifest.push({ id, namespace: unit.ns, count: unit.keys.length, file: join(batchDir, `polish-${id}.json`), out: join(outDir, `polish-${id}.json`) });
}
writeFileSync(join(root, 'work', 'polish-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`wrote ${manifest.length} polish batches, ${manifest.reduce((a, m) => a + m.count, 0)} keys`);
