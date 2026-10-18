// Apply reviewer output (work/polish-out/polish-*.json) to locale/ja/*.json.
// Run: node tools/apply-polish.mjs
//
// Reviewer output shape: { <namespace>: { <key>: "<rewritten ja>" } }.
// Only keys present in the output are changed. Placeholder and empty-value
// violations are rejected per key and reported.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const dir = join(root, 'locale', 'ja');
const outDir = join(root, 'work', 'polish-out');
const placeholders = (s) => [...s.matchAll(/\{[a-zA-Z0-9_.]+\}/g)].map((m) => m[0]).sort().join(',');

const ja = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  ja[f.slice(0, -5)] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
}

const changed = {};
const problems = [];
let files = 0;
if (existsSync(outDir)) {
  for (const f of readdirSync(outDir).filter((x) => x.endsWith('.json'))) {
    let raw;
    try { raw = JSON.parse(readFileSync(join(outDir, f), 'utf8')); } catch (e) { problems.push(`${f}: invalid JSON — ${e.message}`); continue; }
    const data = raw.entries ?? raw;
    files++;
    for (const [ns, entries] of Object.entries(data)) {
      if (!baseline[ns] || !ja[ns]) { problems.push(`${f}: unknown namespace ${ns}`); continue; }
      for (const [key, value] of Object.entries(entries)) {
        if (typeof value !== 'string') continue;
        if (!(key in baseline[ns])) { problems.push(`${f}: ${ns}/${key} not in baseline`); continue; }
        if (value.trim() === '') { problems.push(`${f}: ${ns}/${key} empty`); continue; }
        if (placeholders(value) !== placeholders(baseline[ns][key])) { problems.push(`${f}: ${ns}/${key} placeholder mismatch`); continue; }
        if (value === ja[ns][key]) continue;
        ja[ns][key] = value;
        changed[ns] = (changed[ns] ?? 0) + 1;
      }
    }
  }
}

for (const ns of Object.keys(changed)) {
  const ordered = {};
  for (const key of Object.keys(baseline[ns])) if (key in ja[ns]) ordered[key] = ja[ns][key];
  writeFileSync(join(dir, `${ns}.json`), JSON.stringify(ordered, null, 2) + '\n', 'utf8');
}

console.log(`read ${files} file(s); changed ${Object.values(changed).reduce((a, b) => a + b, 0)} key(s)`);
for (const [ns, n] of Object.entries(changed).sort()) console.log(`  ${ns}: ${n}`);
if (problems.length) {
  console.log(`\nproblems (${problems.length}):`);
  for (const p of problems.slice(0, 40)) console.log('  - ' + p);
  process.exitCode = 1;
}
