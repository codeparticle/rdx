const isObject: (v: any) => boolean = maybeObj =>
  typeof maybeObj === `object` &&
  Object.getPrototypeOf(maybeObj) === Object.getPrototypeOf({})

export {
  isObject,
}