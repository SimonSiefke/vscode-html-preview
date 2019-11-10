export interface RequestType<Params, Result> {
  readonly method: string
  readonly _?: [Readonly<Params>, Readonly<Result>]
}

export const createRequestType: <Params, Result>(
  method: string
) => RequestType<Params, Result> = method => {
  return {
    method,
  }
}
