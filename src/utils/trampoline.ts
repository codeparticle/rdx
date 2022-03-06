const trampoline = <T>(f: (...args: any[]) => T) => (...args: any[]) => {
  let result = f(...args)

  while (typeof result === `function`) {
    result = result()
  }

  return result
}

export { trampoline }
