// Merge translator output (work/out/batch-*.json) into locale/ja/<namespace>.json.
// Run: node tools/merge-out.mjs
//
// Every output file must cover exactly the keys of its batch input. Missing
// keys are reported and left for English fallback; unknown keys are rejected.
// The written JSON keeps the baseline key order so diffs stay readable.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const batchesDir = join(root, 'work', 'batches');
const outDir = join(root, 'work', 'out');
const localeDir = join(root, 'locale', 'ja');

const merged = {};
const problems = [];
let files = 0;
let keys = 0;

for (const f of readdirSync(batchesDir).filter((x) => x.startsWith('batch-') && x.endsWith('.json'))) {
  const batch = JSON.parse(readFileSync(join(batchesDir, f), 'utf8'));
  const outFile = join(outDir, f);
  if (!existsSync(outFile)) {
    problems.push(`${f}: no output file yet`);
    continue;
  }
  const raw = JSON.parse(readFileSync(outFile, 'utf8'));
  const out = raw.entries ?? raw; // accept both {entries:{ns:{...}}} and {ns:{...}}
  files++;
  for (const [ns, entries] of Object.entries(batch.entries)) {
    if (!out[ns]) {
      problems.push(`${f}: missing namespace "${ns}"`);
      continue;
    }
    for (const [key, en] of Object.entries(entries)) {
      const value = out[ns][key];
      if (typeof value !== 'string' || (value.trim() === '' && en.trim() !== '')) {
        problems.push(`${f}: ${ns}/${key} missing or empty`);
        continue;
      }
      if (!(key in baseline[ns])) {
        problems.push(`${f}: ${ns}/${key} not in baseline`);
        continue;
      }
      merged[ns] = merged[ns] ?? {};
      merged[ns][key] = value;
      keys++;
    }
    for (const key of Object.keys(out[ns])) {
      if (!(key in entries)) problems.push(`${f}: ${ns}/${key} not in batch`);
    }
  }
}

for (const [ns, dict] of Object.entries(merged)) {
  const ordered = {};
  for (const key of Object.keys(baseline[ns])) if (key in dict) ordered[key] = dict[key];
  writeFileSync(join(localeDir, `${ns}.json`), JSON.stringify(ordered, null, 2) + '\n', 'utf8');
}

console.log(`merged ${files} batch file(s): ${keys} keys, ${Object.keys(merged).length} namespace(s)`);
if (problems.length) {
  console.log(`\nproblems (${problems.length}):`);
  for (const p of problems.slice(0, 60)) console.log('  - ' + p);
  if (problems.length > 60) console.log(`  … ${problems.length - 60} more`);
  process.exitCode = 1;
}
