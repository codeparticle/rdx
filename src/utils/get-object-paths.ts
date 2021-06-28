/**
 * generates a list of list paths for every possible path of an object
 * @param root root object
 */

import { isObject } from "./is-object"

const getObjectPaths: <T>(root: T) => string[][] = root => {
  const paths = []
  const nodes = [
    {
      obj: root,
      path: [],
    },
  ]

  while (nodes.length > 0) {
    const n = nodes.pop()

    Object.keys(n.obj).forEach(k => {
      const path = n.path.concat(k)

      paths.push(path)

      if (isObject(n.obj[k])) {
        nodes.unshift({
          obj: n.obj[k],
          path: path,
        })
      }

    })
  }

  return paths as string[][]
}

export {
  getObjectPaths,
}
