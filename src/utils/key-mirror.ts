const keyMirror = <K = Array<string>>(keys: K): Record<keyof K, keyof K> | {} => {
  const acc = {}

  if (!(keys as unknown as any[])?.length) {
    return acc
  }

  for(let i = 0, len = (keys as unknown as Array<string>).length; i < len; i++) {
    acc[keys[i]] = keys[i]
  }

  return acc
}

export {
  keyMirror,
}