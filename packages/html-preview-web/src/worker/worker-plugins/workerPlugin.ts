import { WorkerPluginApi } from '../worker-plugin-api/workerPluginApi'

export type WorkerPlugin = (api: WorkerPluginApi) => void
