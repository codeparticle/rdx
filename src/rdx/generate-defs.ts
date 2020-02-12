import {
  charactersBetween,
  filter,
  generateTypeDef,
  generateTypeDefs,
  isReducerName,
  map,
  pipe,
  removePaddingSpaces,
  splitBy,
} from './internal'
import Case from 'case'
import { RdxDefinition, RdxConfiguration } from '../types'

const { camel } = Case

const splitByNewline = splitBy(`\n`)
const formatReducerName = pipe(charactersBetween(`[`, `]`), camel)
const splitTemplateString = pipe<string, string[]>(
  splitByNewline,
  map(removePaddingSpaces),
  filter(Boolean),
)

const defineState = (state: object): RdxDefinition[] => {
  const entries = Object.entries(state).map(([key, value]) => {

    return {
      reducerName: key,
      definitions: generateTypeDefs(value, key),
    }
  })

  return entries
}

const separateDirectives = (
  directiveLines: string[],
  config: RdxConfiguration,
): RdxDefinition[] => {
  const directives = []
  const lines = [...directiveLines]
  let reducerName = config.prefix ?? ``
  let isFirstLine = true

  while (lines.length) {
    const line = lines.shift()

    if (isFirstLine && !isReducerName(line) && reducerName.length) {
      directives.push({
        reducerName,
        definitions: [],
      })

      directives
        .find(d => d.reducerName === reducerName)
        .definitions.push(generateTypeDef(line, reducerName))
    } else if (isReducerName(line)) {
      reducerName = formatReducerName(line)

      directives.push({
        reducerName,
        definitions: [],
      })
    } else {
      directives
        .find(d => d.reducerName === reducerName)
        .definitions.push(generateTypeDef(line, reducerName))
    }

    isFirstLine = false
  }

  return directives
}

function generateDefs<T = string | object | TemplateStringsArray>(values: T, config: RdxConfiguration): RdxDefinition[]
function generateDefs(values, config): RdxDefinition[] {
  let lines = []

  if (typeof values === `string`) {
    lines.push(splitTemplateString(values))

    return separateDirectives(lines[0], config)
  } else if (typeof values === `object` && !Array.isArray(values)) {
    return defineState(values)
  } else {
    lines = values.map(splitTemplateString)

    return separateDirectives(lines[0], config)
  }

}

export { generateDefs }
