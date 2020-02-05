export type TypesObject = Record<string, string>

export type Action<T> = {
  type: string
  payload: T
  id: string
}
export type ActionCreator<T = any> = (payload?: T, id?: string) => Action<T>
export type ActionObject<T = any> = Record<string, ActionCreator<T>>
export type TypeDef = {
  typeName: string
  actionName: string
  selectorName: string
  reducerKey: string
  handlerType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'default'
  initialState: any
  raw?: string
}

export type ConditionalFilter<T = Array<string>> = (
  item: string,
  index: number,
  collection: T
) => boolean

export type SelectorsObject = Record<string, (state: object) => any>

export type RdxDefinition = { reducerName: string; definitions: Array<TypeDef> }

export type RdxConfiguration = {
  prefix?: string
}
