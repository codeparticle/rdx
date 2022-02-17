const trampoline = <T>(f: (...args: any[]) => T) => (...args: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  let result = f(...args)

  while (typeof result === `function`) {
    result = result()
  }

  return result
}

export { trampoline }
