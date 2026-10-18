// Read-only audit for naturalness problems that the hard checks do not catch.
// Run: node tools/audit.mjs
//
// Prints grouped warnings. Nothing is modified; fix the flagged rows through
// docs/review.csv or locale/ja/*.json and re-run `npm run check`.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const dir = join(root, 'locale', 'ja');
const ja = {};
if (existsSync(dir)) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    ja[basename(f, '.json')] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  }
}

const buckets = new Map();
const add = (kind, ns, key, value, en) => {
  if (!buckets.has(kind)) buckets.set(kind, []);
  buckets.get(kind).push({ ns, key, value, en });
};

for (const [ns, dict] of Object.entries(ja)) {
  for (const [key, value] of Object.entries(dict)) {
    const en = baseline[ns]?.[key] ?? '';
    if (typeof value !== 'string') continue;
    if (/あなた/.test(value)) add('「あなた」を使っている', ns, key, value, en);
    if (/[ ][、。！？]/.test(value)) add('句読点の前に半角スペース', ns, key, value, en);
    if (/。。|、、|・・/.test(value)) add('約物の重複', ns, key, value, en);
    if (/\.\.\./.test(value)) add('三点リーダーが半角', ns, key, value, en);
    if (/。$/.test(value) && value.length <= 12 && !/[。]/.test(en)) add('短いラベルに「。」', ns, key, value, en);
    if (/^[「『]/.test(value) === false && /。$/.test(value) && /^[A-Z][a-z]+$/.test(en)) add('1語ラベルに「。」', ns, key, value, en);
    if (/です$|ます$/.test(value) && value.length > 30) add('長い文の文末に「。」がない', ns, key, value, en);
    if (/(session|agent|skill|workspace|plugin|prompt|token|model|sandbox)/i.test(value) && !/^[A-Z0-9]/.test(value)) {
      add('英単語が残っている', ns, key, value, en);
    }
    if (value.length > 55 && /、.*、.*、/.test(value)) add('一文が長い（読点3つ以上）', ns, key, value, en);
  }
}

let total = 0;
for (const [kind, items] of buckets) {
  total += items.length;
  console.log(`\n### ${kind} (${items.length})`);
  for (const it of items.slice(0, 25)) {
    console.log(`  ${it.ns}/${it.key}`);
    console.log(`    en: ${it.en.slice(0, 100)}`);
    console.log(`    ja: ${it.value.slice(0, 100)}`);
  }
  if (items.length > 25) console.log(`  … ${items.length - 25} more`);
}
console.log(`\ntotal flags: ${total}`);
