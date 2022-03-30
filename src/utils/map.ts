/**
 * map a function over a collection or a single item.
 * returns a collection.
 * @param fn
 */

function map<I, O = any>(fn: (v: I) => O): (collection: I[] | I) => O[]
function map<I, O = any[]>(fn: (v: I) => O): (collection: I[] | I) => O
function map<I, O>(fn: (v: I) => O) {
  return (collection: I[] | I): O | O[] =>
    Array.isArray(collection) ? collection.map(fn) : [collection].map(fn)
}

export { map }
