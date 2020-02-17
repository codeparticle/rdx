/**
 * generates a list of list paths for every possible path of an object
 * @param root root object
 */

import { isObject } from "./is-object"

const getObjectPaths = (root: Record<string, any>): string[][] => {
  const paths = []
  let currentPath = root
  let currentKey = ``

  const keys = Object.keys(root)
  let k = keys.length

  while (k--) {
    currentKey = keys[k]
    currentPath = root[currentKey]
    paths.push([currentKey])

    if (isObject(currentPath)) {
      const subPaths = getObjectPaths(currentPath)
      let l = subPaths.length

      while (l--) {
        paths.push([currentKey,subPaths[l]])
      }
    }
  }

  return paths
}

export {
  getObjectPaths,
}