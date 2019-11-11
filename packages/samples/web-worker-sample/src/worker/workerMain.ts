import { WorkerPluginApi, workerPluginCore } from 'html-preview-web'
import { workerConnectionProxy } from './worker-plugin-api/workerConnectionProxy'
// @ts-ignore
import remoteScript from 'raw-loader!../../dist/remoteMain.js'

const api: WorkerPluginApi = {
  connectionProxy: workerConnectionProxy,
  $remoteScript: `<script>${remoteScript}</script>`,
  state: {},
}

workerPluginCore(api)
