import { WorkerPluginApi } from '../worker-plugin-api/workerPluginApi'

export type LocalPlugin = (api: WorkerPluginApi) => void
