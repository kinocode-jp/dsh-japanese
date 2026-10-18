// Split tools/en.baseline.json into translation batches under work/batches/.
// Run: node tools/make-batches.mjs [maxKeysPerBatch]
//
// Batches pack several small namespaces together; a namespace larger than the
// limit is split into numbered parts that keep the original key order. Every
// batch has the shape:
//   { id, namespaces: [...], entries: { <namespace>: { <key>: <english> } } }
// The translator writes the same shape with Japanese values to work/out/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const limit = Number(process.argv[2] ?? 80);
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));

const batchDir = join(root, 'work', 'batches');
const outDir = join(root, 'work', 'out');
for (const dir of [batchDir, outDir]) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

const units = [];
for (const ns of Object.keys(baseline).sort()) {
  const keys = Object.keys(baseline[ns]);
  if (keys.length <= limit) {
    units.push({ namespace: ns, part: 1, keys });
  } else {
    let part = 0;
    for (let i = 0; i < keys.length; i += limit) {
      units.push({ namespace: ns, part: ++part, keys: keys.slice(i, i + limit) });
    }
  }
}

const batches = [];
let current = null;
for (const unit of units) {
  const isPart = unit.part > 1 || baseline[unit.namespace] && Object.keys(baseline[unit.namespace]).length > limit;
  const size = unit.keys.length;
  if (!current || isPart || current.count + size > limit || current.units.some((u) => u.namespace === unit.namespace)) {
    current = { units: [], count: 0 };
    batches.push(current);
  }
  current.units.push(unit);
  current.count += size;
}

const manifest = [];
let n = 0;
for (const batch of batches) {
  const id = String(++n).padStart(3, '0');
  const entries = {};
  const namespaces = [];
  for (const unit of batch.units) {
    entries[unit.namespace] = entries[unit.namespace] ?? {};
    for (const key of unit.keys) entries[unit.namespace][key] = baseline[unit.namespace][key];
    if (!namespaces.includes(unit.namespace)) namespaces.push(unit.namespace);
  }
  const payload = { id, namespaces, entries };
  const file = join('work', 'batches', `batch-${id}.json`);
  writeFileSync(join(root, file), JSON.stringify(payload, null, 2) + '\n', 'utf8');
  manifest.push({
    id,
    namespaces,
    count: batch.count,
    file: join(root, file),
    out: join(root, 'work', 'out', `batch-${id}.json`),
  });
}
writeFileSync(join(root, 'work', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`wrote ${manifest.length} batches (limit ${limit} keys) -> work/batches/`);
console.log(`total keys: ${manifest.reduce((a, m) => a + m.count, 0)}`);
for (const m of manifest) console.log(`  ${m.id}: ${m.count} keys — ${m.namespaces.join(', ')}`);
