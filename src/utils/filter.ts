/**
 * HOF version of Array.prototype.filter
 * @param fn
 */

const filter = <T>(fn: (v: T) => boolean) => (x: T[]) => [].concat(x).filter(fn)

export { filter }
