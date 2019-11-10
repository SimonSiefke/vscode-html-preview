import {
  WorkerPluginApi,
  workerPluginGetGeneratedHtml,
  workerPluginGetDiffs,
} from 'html-preview-web'
import { createWorkerConnectionProxy } from './worker-plugin-api/workerConnectionProxy'
// @ts-ignore
import remoteScript from 'raw-loader!../../dist/remoteMain.js'

const api: WorkerPluginApi = {
  connectionProxy: createWorkerConnectionProxy(),
  remoteScript,
  state: {},
}

workerPluginGetGeneratedHtml(api)
workerPluginGetDiffs(api)
