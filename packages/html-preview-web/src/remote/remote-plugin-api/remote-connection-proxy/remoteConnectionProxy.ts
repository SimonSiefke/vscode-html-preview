import { Thenable } from '../../../shared/thenable'

export interface RemoteConnectionProxy {
  readonly onRequest: <Params, Result>(
    requestType: string,
    listener: (params: Params) => Thenable<Result>
  ) => void
}
