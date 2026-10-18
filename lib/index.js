// Host half (node). The browser half (dictionaries and fonts) ships through
// exports["./client"]. The host half registers a session-title provider that
// always titles sessions in Japanese (see ./session-title.js); the bundle patch
// disables DSH's built-in `session-title-llm` row so this provider can take its
// place.

/**
 * Host plugin body: register the Japanese session-title provider once the
 * session-title and LLM services are available. Loading the provider module
 * lazily keeps the browser half working even if its host dependencies are
 * missing; a failure is logged instead of breaking the plugin.
 * @param ctx - plugin context.
 */
export function apply(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['sessionTitle', 'llm'], child => {
    child.effect(() => {
      let active = true
      import('./session-title.js').then(module => {
        if (active) module.registerJapaneseSessionTitle(child)
      }).catch(error => {
        const log = child.logger?.warn ?? console.warn
        log('[dsh-japanese] Japanese session-title provider unavailable', error?.message ?? error)
      })
      return () => { active = false }
    }, 'dsh-japanese: Japanese session titles')
  })
}
