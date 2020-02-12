/**
 * generates a list of list paths for every possible path of an object
 * credit to https://lowrey.me/getting-all-paths-of-an-javascript-object/
 * @param root root object
 */

const paths: <T>(root: T) => string[][] = (root) => {
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
      nodes.unshift({
        obj: n.obj[k],
        path: path,
      })
    })
  }

  return paths
}

export {
  paths,
}