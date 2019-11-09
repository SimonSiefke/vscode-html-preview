import {
  LocalConnectionProxy,
  createWorkerConnectionProxy,
  WorkerPluginApi,
  WorkerConnectionProxy,
  workerPluginGetGeneratedHtml,
  workerPluginGetDiffs,
} from 'html-preview-web'

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
  remoteScriptUrl: '/dist/remoteMain.js',
}

workerPluginGetGeneratedHtml(api)
workerPluginGetDiffs(api)

const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  if (!resolvers[requestType.method]) {
    throw new Error(`no resolver for request type "${requestType.method}"`)
  }
  return resolvers[requestType.method](params)
}

export const createLocalConnectionProxy: () => LocalConnectionProxy = () => ({
  sendRequest,
})
