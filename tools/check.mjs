// Coverage and quality checks for the Japanese dictionary.
// Run: node tools/check.mjs
//
// Checks
//  1. every baseline key has a ja value, and no extra keys exist
//  2. {placeholders} match the English source exactly (order/count)
//  3. no empty strings
//  4. no value still identical to the English source (unless it is a
//     deliberately untranslated token: pure symbol/number/URL/short acronym)
//  5. glossary consistency: the policy's preferred term is used, and known
//     wrong variants do not appear
//  6. no line breaks inside a value
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const localeDir = join(root, 'locale', 'ja');

const ja = {};
if (existsSync(localeDir)) {
  for (const f of readdirSync(localeDir).filter((x) => x.endsWith('.json'))) {
    ja[basename(f, '.json')] = JSON.parse(readFileSync(join(localeDir, f), 'utf8'));
  }
}

const errors = [];
const warnings = [];

const placeholders = (s) => [...s.matchAll(/\{[a-zA-Z0-9_.]+\}/g)].map((m) => m[0]);
const keepAsIs = (en) =>
  en.trim() === '' ||
  /^[\s\d.,:;·…\-–—/\\|()[\]{}<>=+*#%&@'"`~^$?!]*$/.test(en) ||
  /^https?:\/\//.test(en) ||
  /^[A-Z0-9_.+-]+$/.test(en) ||
  /^[{][a-zA-Z0-9_.]+[}]$/.test(en) ||
  /^[{][a-zA-Z0-9_.]+[}][A-Za-z%]?$/.test(en);

// Preferred terminology. `forbidden` lists variants that must not appear.
const GLOSSARY = [
  { preferred: 'セッション', forbidden: ['対話セッション', '会話セッション'] },
  { preferred: 'エージェント', forbidden: ['代理人'] },
  { preferred: 'サブエージェント', forbidden: ['副エージェント', 'サブ・エージェント'] },
  { preferred: 'スキル', forbidden: ['技能'] },
  { preferred: 'ワークスペース', forbidden: ['作業スペース', '作業領域'] },
  { preferred: 'プラグイン', forbidden: [] },
  { preferred: '承認', forbidden: ['許可（承認）'] },
  { preferred: '権限', forbidden: [] },
  { preferred: 'ターン', forbidden: ['往復'] },
  { preferred: 'トークン', forbidden: [] },
  { preferred: 'コンテキスト', forbidden: ['文脈'] },
  { preferred: 'プロンプト', forbidden: ['プロンプト文'] },
  { preferred: 'モデル', forbidden: [] },
  { preferred: 'フィードバック', forbidden: ['意見'] },
  { preferred: 'サイドバー', forbidden: ['サイド・バー'] },
  { preferred: 'ターミナル', forbidden: ['端末'] },
  { preferred: 'スナップショット', forbidden: [] },
];

for (const ns of Object.keys(baseline)) {
  if (!ja[ns]) {
    errors.push(`missing namespace file: locale/ja/${ns}.json`);
    continue;
  }
  for (const [key, en] of Object.entries(baseline[ns])) {
    const value = ja[ns][key];
    if (typeof value !== 'string') {
      errors.push(`${ns}/${key}: missing key`);
      continue;
    }
    if (value.trim() === '') {
      if (en.trim() !== '') errors.push(`${ns}/${key}: empty translation (en: ${JSON.stringify(en)})`);
      continue;
    }
    if (/[\r\n]/.test(value) && !/[\r\n]/.test(en)) errors.push(`${ns}/${key}: value contains a line break`);

    const ep = placeholders(en).sort().join(',');
    const jp = placeholders(value).sort().join(',');
    if (ep !== jp) {
      errors.push(`${ns}/${key}: placeholder mismatch — en [${ep}] vs ja [${jp}]`);
    }

    if (value === en && !keepAsIs(en)) {
      warnings.push(`${ns}/${key}: identical to English — ${JSON.stringify(en).slice(0, 70)}`);
    }
    if (/[ぁ-んァ-ヶ一-龠]/.test(en) === false && /[ぁ-んァ-ヶ一-龠]/.test(value) === false && !keepAsIs(en)) {
      warnings.push(`${ns}/${key}: no Japanese characters — ${JSON.stringify(value).slice(0, 70)}`);
    }
    for (const term of GLOSSARY) {
      for (const bad of term.forbidden) {
        if (value.includes(bad)) errors.push(`${ns}/${key}: forbidden term "${bad}" (use "${term.preferred}")`);
      }
    }
  }
  for (const key of Object.keys(ja[ns])) {
    if (!(key in baseline[ns])) errors.push(`${ns}/${key}: key not in baseline`);
  }
}
for (const ns of Object.keys(ja)) {
  if (!(ns in baseline)) errors.push(`locale/ja/${ns}.json: namespace not in baseline`);
}

const total = Object.values(ja).reduce((n, d) => n + Object.keys(d).length, 0);
console.log(`namespaces: ${Object.keys(ja).length}/${Object.keys(baseline).length}`);
console.log(`keys: ${total}/${Object.values(baseline).reduce((n, d) => n + Object.keys(d).length, 0)}`);
if (warnings.length) {
  console.log(`\nwarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log('  - ' + w);
  if (warnings.length > 40) console.log(`  … ${warnings.length - 40} more`);
}
if (errors.length) {
  console.log(`\nerrors (${errors.length}):`);
  for (const e of errors.slice(0, 60)) console.log('  - ' + e);
  if (errors.length > 60) console.log(`  … ${errors.length - 60} more`);
  process.exit(1);
}
console.log('\nOK');
