/**
 * split a string by a delimiter
 * @param character
 */
export const splitBy: (c: string) => (s: string) => string[] = character => str =>
  str.split(character)
