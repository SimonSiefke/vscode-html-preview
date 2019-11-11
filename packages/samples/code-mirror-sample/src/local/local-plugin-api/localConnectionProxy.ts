import { LocalConnectionProxy } from 'html-preview-web/dist/local/localMain'
import {
  WorkerPluginApi,
  WorkerConnectionProxy,
  workerPluginCore,
} from 'html-preview-web/dist/worker/workerMain'

const resolvers: {
  [method: string]: (params: any) => any
} = {}

const onRequest: WorkerConnectionProxy['onRequest'] = (() => {
  return <WorkerConnectionProxy['onRequest']>((requestType, resolver) => {
    if (resolvers[requestType]) {
      throw new Error(`duplicate resolver for request type "${requestType}"`)
    }
    resolvers[requestType] = resolver
  })
})()

const api: WorkerPluginApi = {
  connectionProxy: { onRequest },
  state: {},
  $remoteScript: '<script type="module" src="./dist/remoteMain.js"></script>',
}

workerPluginCore(api)

const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  if (!resolvers[requestType]) {
    throw new Error(`no resolver for request type "${requestType}"`)
  }
  return resolvers[requestType](params)
}

export const localConnectionProxy: LocalConnectionProxy = {
  sendRequest,
}
