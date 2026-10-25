// Exercise the shipped ModuleLoader artifact, not a copied registration snippet.
import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
const source=readFileSync(new URL('../lib/client.js',import.meta.url),'utf8')
function fixture() {
  let plugin
  vm.runInNewContext(source,{window:{__ModuleLoader__:{load:m=>{plugin=m.factory(()=>({}))}}}})
  const languages=new Map(),dicts=new Map()
  const locale={
    addLanguage(def){if(languages.has(def.id))throw Error('already registered');languages.set(def.id,def);return()=>languages.delete(def.id)},
    register(ns,pairs){if(dicts.has(ns))throw Error('already has locale');dicts.set(ns,pairs);return()=>dicts.delete(ns)},
  }
  function mount() {const offs=[];plugin.apply({locale,effect(fn){const off=fn();if(typeof off==='function')offs.push(off)}});return()=>offs.reverse().forEach(off=>off())}
  return {plugin,locale,languages,dicts,mount}
}
test('JP-1: teardown removes owned language and all dictionaries; remount works',()=>{
  const f=fixture(),off=f.mount();assert.equal(f.languages.get('ja').fallback,'en');assert.equal(f.dicts.size,80)
  off();assert.equal(f.dicts.size,0);assert.equal(f.languages.size,0)
  const again=f.mount();assert.equal(f.languages.size,1);again();assert.equal(f.languages.size,0)
})
test('JP-1: duplicate registration cleanup does not remove original owner',()=>{
  const f=fixture(),owner=f.mount(),duplicate=f.mount()
  duplicate();assert.equal(f.languages.has('ja'),true);assert.equal(f.dicts.size,80)
  owner();assert.equal(f.languages.size,0);assert.equal(f.dicts.size,0)
})
test('JP-1: unrelated registration failure propagates rather than being swallowed',()=>{
  const f=fixture();f.locale.addLanguage=()=>{throw Error('fixture failure')}
  assert.throws(()=>f.mount(),/fixture failure/)
})
