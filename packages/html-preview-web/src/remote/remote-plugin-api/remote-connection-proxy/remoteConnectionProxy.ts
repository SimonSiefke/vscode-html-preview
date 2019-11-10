import { RequestType } from '../../../shared/requestType'
import { Thenable } from '../../../shared/thenable'

export interface RemoteConnectionProxy {
  readonly onRequest: <Params, Result>(
    requestType: RequestType<Params, Result>,
    listener: (params: Params) => Thenable<Result>
  ) => void
}
