export interface LocalConnectionProxy {
  readonly sendRequest: <Params, Result>(requestType: string, params: Params) => Promise<Result>
}
