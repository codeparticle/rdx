/**
 * map a function over a collection
 * @param fn
 */

function map<I, O = any>(fn: (v: I) => O): (collection: Array<I> | I) => Array<O>
function map<I, O = any[]>(fn: (v: I) => O): (collection: Array<I> | I) => O
function map<I, O>(fn: (v: I) => O) {
  return (collection: Array<I> | I): O | O[] =>
    Array.isArray(collection) ? collection.map(fn) : [collection].map(fn)
}

export { map }
