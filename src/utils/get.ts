/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
const get = (state, path: string[], backupValue: any = null) => {
  let currentLevel = state
  let i = 0
  const len = path.length

  while (i < len) {
    currentLevel = currentLevel?.[path[i]] ?? backupValue
    i++
  }

  return currentLevel
}

export { get }