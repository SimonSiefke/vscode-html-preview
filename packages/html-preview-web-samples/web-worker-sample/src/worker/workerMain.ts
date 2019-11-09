import {
  WorkerPluginApi,
  workerPluginGetGeneratedHtml,
  workerPluginGetDiffs,
} from 'html-preview-web'
import { createWorkerConnectionProxy } from './worker-plugin-api/workerConnectionProxy'

const api: WorkerPluginApi = {
  connectionProxy: createWorkerConnectionProxy(),
  remoteScriptUrl: '/dist/remoteMain.js',
  state: {},
}

workerPluginGetGeneratedHtml(api)
workerPluginGetDiffs(api)
