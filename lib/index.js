// Host half (node): this plugin only contributes browser dictionaries, so the
// host row is intentionally empty. The empty apply gives the Loader a host-side
// row while the browser half ships through exports["./client"].

/** Host plugin body — browser presentation only. */
export function apply() {}
