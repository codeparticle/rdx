/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
const get = (state, path: string[], backupValue?: any) => {
  let currentLevel = state

  for (let i = 0; i < path.length; i++) {
    currentLevel = currentLevel?.[path[i]] ?? (backupValue || null)
  }

  return currentLevel
}

export { get }