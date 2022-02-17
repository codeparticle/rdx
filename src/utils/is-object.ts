const isObject: (v: any) => boolean = maybeObj =>
  !!maybeObj &&
  typeof maybeObj !== `function` &&
  typeof maybeObj === `object` &&
  !Array.isArray(maybeObj) &&
  maybeObj === Object(maybeObj)

export {
  isObject,
}
