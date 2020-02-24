const keyMirror = <K>(keys: K extends Array<any> ? K : K[]): Record<keyof K, keyof K> | {} => {
  const acc = {}

  if (!keys?.length) {
    return acc
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    acc[`${keys[i]}`] = `${keys[i]}`
  }

  return acc
}

export { keyMirror }
