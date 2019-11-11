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
   * The remote script which will be injected in the html of the preview, e.g. `<script src="/dist/remoteMain.js"></script>`
   */
  readonly $remoteScript: string
}
