import { WorkerPluginApi, workerPluginCore } from 'html-preview-web/dist/worker/workerMain'
import { workerConnectionProxy } from './worker-plugin-api/workerConnectionProxy'

const api: WorkerPluginApi = {
  connectionProxy: workerConnectionProxy,
  $remoteScript: `<script src="./dist/remoteMain.js"></script>`,
  state: {},
}

workerPluginCore(api)
