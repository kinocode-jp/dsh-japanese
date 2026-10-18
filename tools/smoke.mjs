// Smoke test: load the built client bundle against a stub ModuleLoader and a
// minimal locale runtime that mirrors the real contract (addLanguage/register
// with en fallback). Run: node tools/smoke.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'lib', 'client.js'), 'utf8');

const fail = (msg) => { throw new Error(msg); };
const expect = (cond, msg) => { if (!cond) fail(msg); };

let captured;
globalThis.window = { __ModuleLoader__: { load: (m) => { captured = m; } } };
(0, eval)(src);
expect(captured?.id === 'dsh-locale-ja', 'bundle id mismatch: ' + captured?.id);
const { apply, inject } = captured.factory(() => fail('no requires expected'));
expect(JSON.stringify(inject) === JSON.stringify(['locale']), 'inject must be ["locale"]');

const LANGS = JSON.parse(src.match(/const LANGS = (\[[\s\S]*?\n\]);/)[1]);
const DICTS = JSON.parse(src.match(/const DICTS = (\{[\s\S]*\n\});/)[1]);
expect(LANGS.length === 1 && LANGS[0].id === 'ja', 'bundle must ship exactly ja');
const nsCount = Object.keys(DICTS.ja).length;
const keyCount = Object.values(DICTS.ja).reduce((n, d) => n + Object.keys(d).length, 0);
console.log(`bundle: ${LANGS.length} language, ${nsCount} namespaces, ${keyCount} keys`);

const languages = new Map();
const dicts = new Map();
const effects = [];
const ctx = {
  effect(fn, label) { effects.push(label); fn(); },
  locale: {
    addLanguage(input) {
      if (languages.has(input.id)) throw new Error(`locale "${input.id}" is already registered`);
      languages.set(input.id, input);
      return () => {};
    },
    register(ns, pairs) {
      const m = dicts.get(ns) ?? new Map();
      dicts.set(ns, m);
      for (const [lang, dict] of Object.entries(pairs)) {
        if (m.has(lang)) throw new Error(`locale namespace "${ns}" already has locale "${lang}"`);
        m.set(lang, dict);
      }
      return () => {};
    },
  },
};

apply(ctx);
expect(languages.get('ja')?.fallback === 'en', 'ja must fall back to en');
expect(dicts.size === nsCount, `registered ${dicts.size} namespaces, expected ${nsCount}`);

// double load must not throw
apply(ctx);

// spot check
const common = dicts.get('common')?.get('ja');
if (common) expect(common.ok === 'OK', 'common/ok should stay OK');

const baseline = JSON.parse(readFileSync(join(root, 'tools', 'en.baseline.json'), 'utf8'));
const unresolved = Object.entries(DICTS.ja).flatMap(([ns, d]) =>
  Object.entries(d)
    .filter(([k, v]) => v.trim() === '' && (baseline[ns]?.[k] ?? '').trim() !== '')
    .map(([k]) => `${ns}/${k}`));
expect(unresolved.length === 0, 'empty values: ' + unresolved.join(', '));

console.log(`effects: ${effects.length}`);
console.log('OK');
