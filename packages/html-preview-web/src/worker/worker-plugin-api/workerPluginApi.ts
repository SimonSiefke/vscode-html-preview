import { WorkerConnectionProxy } from './worker-connection-proxy/workerConnectionProxy'
import { WorkerState } from './worker-state/workerState'

export interface WorkerPluginApi {
  readonly connectionProxy: WorkerConnectionProxy
  readonly state: WorkerState
}
