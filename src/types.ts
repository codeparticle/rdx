export type TypesObject<T = {[key: string]: string}> = Record<keyof T, keyof T>
export type StateValue = any
export type StateObject =
  | { [key: string]: StateValue }

export type Action<T = never> = {
  type: string
  payload?: T
  id: string
}

export type ActionObject<T = any> = Record<string, ActionCreator<T>>

export type ActionCreator<T = undefined> = (payload?: T, id?: string) => Action<T> | Action<never>

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

export type UserDefinedReducers = {
  [key: string]: StateObject
}

export type SelectorsObject = Record<string, (state: object) => any>

export type Reducer<S, A=Action<S>> = (state: S, action: A) => S

export type RdxDefinition = { reducerName: string; definitions: Array<TypeDef> }

export type RdxConfiguration = {
  prefix?: string
  types?: TypesObject
}

export type RdxOutput<State> = {
  actions: ActionObject
  reducers: Reducer<State>
  selectors: SelectorsObject
  types: TypesObject
}