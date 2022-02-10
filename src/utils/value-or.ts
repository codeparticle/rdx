/**
 * check to see if a value is defined, and if it's not, return a backup.
 */

const valueOr = <T, B = T>(v: T, backup: B): T | B => {
  try {
    return v ?? backup
  } catch (_) {
    return backup
  }
}

export { valueOr }
