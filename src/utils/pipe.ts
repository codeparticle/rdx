/**
 * Pipe a set of functions over an argument, starting at the leftmost argument
 *
 * @author Nick Krause
 * @license MIT
 */

const pipe = <I, O = I>(...fns: Array<(v: any) => any>) => (x: I) =>
  fns.reduce((v, f) => f(v), x) as O

export { pipe }
