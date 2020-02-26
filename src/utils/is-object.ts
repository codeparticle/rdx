const isObject: (v: any) => boolean = maybeObj =>
  maybeObj !== undefined &&
  maybeObj !== null &&
  typeof maybeObj === `object` &&
  Object.getPrototypeOf(maybeObj) === Object.getPrototypeOf({})

export {
  isObject,
}