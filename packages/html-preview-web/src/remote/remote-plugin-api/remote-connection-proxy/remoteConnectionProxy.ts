import { Thenable } from '../../../shared/thenable'

export interface RemoteConnectionProxy {
  /**
   * Listener for requests
   */
  readonly onRequest: <Params, Result>(
    requestType: string,
    listener: (params: Params) => Thenable<Result>
  ) => void
}
