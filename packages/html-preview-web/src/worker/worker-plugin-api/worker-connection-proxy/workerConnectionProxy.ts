import { RequestType } from '../../../shared/requestType'
import { Thenable } from '../../../shared/thenable'

export interface WorkerConnectionProxy {
  readonly onRequest: <Params, Result>(
    requestType: RequestType<Params, Result>,
    resolver: (params: Params) => Thenable<Result>
  ) => void
}

export const createWorkerConnectionProxy: ({
  onRequest,
}: {
  onRequest: WorkerConnectionProxy['onRequest']
}) => WorkerConnectionProxy = ({ onRequest }) => {
  return {
    onRequest,
  }
}
