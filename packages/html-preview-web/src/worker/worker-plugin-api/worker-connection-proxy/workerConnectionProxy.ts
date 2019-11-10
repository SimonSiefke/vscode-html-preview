import { Thenable } from '../../../shared/thenable'

export interface WorkerConnectionProxy {
  readonly onRequest: <Params, Result>(
    requestType: string,
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
