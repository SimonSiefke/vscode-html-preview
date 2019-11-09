import { LocalConnectionProxy } from '../../local-plugin-api/local-connection-proxy/localConnectionProxy'
import { WorkerPluginApi } from '../../../worker/worker-plugin-api/workerPluginApi'
import {
  createWorkerConnectionProxy,
  WorkerConnectionProxy,
} from '../../../worker/worker-plugin-api/worker-connection-proxy/workerConnectionProxy'
import { workerPluginGetGeneratedHtml } from '../../../worker/worker-plugins/worker-plugin-get-generated-html/workerPluginGenerateHtml'
import { workerPluginGetDiffs } from '../../../worker/worker-plugins/worker-plugin-get-diffs/workerPluginGetDiffs'

const resolvers: {
  [method: string]: (params: any) => any
} = {}

export const onRequest: WorkerConnectionProxy['onRequest'] = (() => {
  return <WorkerConnectionProxy['onRequest']>((requestType, resolver) => {
    if (resolvers[requestType.method]) {
      throw new Error(`duplicate resolver for request type "${requestType.method}"`)
    }
    resolvers[requestType.method] = resolver
  })
})()

const api: WorkerPluginApi = {
  connectionProxy: createWorkerConnectionProxy({ onRequest }),
  state: {},
}

workerPluginGetGeneratedHtml(api)
workerPluginGetDiffs(api)

export const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  if (!resolvers[requestType.method]) {
    throw new Error(`no resolver for request type "${requestType.method}"`)
  }
  return resolvers[requestType.method](params)
}

export const adapterWeb = {
  sendRequest,
}
