export const removePaddingSpaces = (s: string | undefined) =>
  s?.replace(/(\s\s|\t)/g, ``).trim() ?? ``
