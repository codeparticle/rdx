/**
 * execute a side effect on a value, returning the value as it was.
 */

const tap =
  <F extends (...args: any[]) => any>(fn: F) =>
    <X>(x: X) => {
      fn(x)

      return x
    }

export { tap }
