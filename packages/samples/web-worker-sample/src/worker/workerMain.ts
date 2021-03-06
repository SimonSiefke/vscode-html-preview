import {
  WorkerPluginApi,
  workerPluginCore,
  workerPluginGetHighlights,
} from 'html-preview-web/dist/worker/workerMain'
import { workerConnectionProxy } from './worker-plugin-api/workerConnectionProxy'

const api: WorkerPluginApi = {
  connectionProxy: workerConnectionProxy,
  $remoteScript: `<script src="./dist/remoteMain.js" data-html-preview></script>`,
  state: {},
}

workerPluginCore(api)
workerPluginGetHighlights(api)
