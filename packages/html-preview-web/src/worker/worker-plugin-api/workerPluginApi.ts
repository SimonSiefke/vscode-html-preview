import { WorkerConnectionProxy } from './worker-connection-proxy/workerConnectionProxy'
import { WorkerState } from './worker-state/workerState'

export interface WorkerPluginApi {
  /**
   * Used for communicating with the local code
   */
  readonly connectionProxy: WorkerConnectionProxy
  /**
   * State of the worker
   */
  readonly state: WorkerState
  /**
   * Url of the remote script, e.g. '/dist/remoteMain.js'
   */
  readonly remoteScriptUrl: string
}
