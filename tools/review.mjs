// Review workflow for the Japanese dictionary.
//
//   node tools/review.mjs export   -> docs/review.csv (open in Numbers/Excel)
//   node tools/review.mjs import   -> apply the edited `ja` column back into locale/ja/*.json
//
// The CSV has one row per key: namespace, key, en, ja, note.
// Edit only the `ja` column. Leave `note` free-form; it is ignored on import.
// Rows whose key is missing from the CSV are left untouched.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const localeDir = join(root, 'locale', 'ja');
const csvPath = join(root, 'docs', 'review.csv');

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const mode = process.argv[2] ?? 'export';

if (mode === 'export') {
  const ja = {};
  if (existsSync(localeDir)) {
    for (const f of readdirSync(localeDir).filter((x) => x.endsWith('.json'))) {
      ja[basename(f, '.json')] = JSON.parse(readFileSync(join(localeDir, f), 'utf8'));
    }
  }
  const lines = ['namespace,key,en,ja,note'];
  let rows = 0;
  for (const ns of Object.keys(baseline).sort()) {
    for (const key of Object.keys(baseline[ns]).sort()) {
      lines.push([ns, key, baseline[ns][key], ja[ns]?.[key] ?? '', ''].map(csvEscape).join(','));
      rows++;
    }
  }
  writeFileSync(csvPath, '\ufeff' + lines.join('\n') + '\n', 'utf8');
  console.log(`exported ${rows} rows -> docs/review.csv`);
} else if (mode === 'import') {
  if (!existsSync(csvPath)) throw new Error('docs/review.csv not found — run `node tools/review.mjs export` first');
  const rows = parseCsv(readFileSync(csvPath, 'utf8'));
  const head = rows.shift().map((h) => h.trim());
  const ci = (name) => head.indexOf(name);
  const [nsI, keyI, enI, jaI] = ['namespace', 'key', 'en', 'ja'].map(ci);
  if ([nsI, keyI, enI, jaI].some((i) => i < 0)) throw new Error(`bad header: ${head.join(',')}`);

  const ja = {};
  for (const f of readdirSync(localeDir).filter((x) => x.endsWith('.json'))) {
    ja[basename(f, '.json')] = JSON.parse(readFileSync(join(localeDir, f), 'utf8'));
  }
  let changed = 0, skipped = 0;
  const touched = new Set();
  for (const r of rows) {
    if (!r.length || (r.length === 1 && r[0].trim() === '')) continue;
    const ns = r[nsI], key = r[keyI], en = r[enI], value = r[jaI];
    if (!(ns in baseline)) { skipped++; continue; }
    if (!(key in baseline[ns])) { skipped++; continue; }
    if (baseline[ns][key] !== en) { skipped++; continue; } // key/English drift: do not guess
    if (value === undefined || value === '') { skipped++; continue; }
    if (!ja[ns]) ja[ns] = {};
    if (ja[ns][key] !== value) { ja[ns][key] = value; changed++; touched.add(ns); }
  }
  for (const ns of touched) {
    const ordered = {};
    for (const key of Object.keys(baseline[ns])) if (key in ja[ns]) ordered[key] = ja[ns][key];
    writeFileSync(join(localeDir, `${ns}.json`), JSON.stringify(ordered, null, 2) + '\n', 'utf8');
  }
  console.log(`applied ${changed} changed row(s) across ${touched.size} namespace(s); skipped ${skipped}`);
  console.log('next: node tools/check.mjs && node tools/build-client.mjs');
} else {
  throw new Error(`unknown mode: ${mode} (expected export|import)`);
}
