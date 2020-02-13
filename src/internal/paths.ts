/**
 * generates a list of list paths for every possible path of an object
 * @param root root object
 */

import { isObject } from "./is-object"

const getAllPaths = (root): string[][] => {
  const paths = []
  let currentPath = root
  let currentKey = ``

  const keys = Object.keys(root)
  let k = keys.length

  while (k--) {
    currentKey = keys[k]
    paths.push([currentKey])

    currentPath = root[currentKey]

    if (isObject(currentPath)) {
      const subPaths = getAllPaths(currentPath)
      let l = subPaths.length

      while (l--) {
        paths.push([currentKey,subPaths[l]])
      }
    }
  }

  return paths
}

const paths = getAllPaths

export {
  paths,
}