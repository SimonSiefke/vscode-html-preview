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
    if (resolvers[requestType]) {
      throw new Error(`duplicate resolver for request type "${requestType}"`)
    }
    resolvers[requestType] = resolver
  })
})()

const api: WorkerPluginApi = {
  connectionProxy: createWorkerConnectionProxy({ onRequest }),
  state: {},
  $remoteScript: '<script type="module" src="./dist/remoteMain.js"></script>',
}

workerPluginGetGeneratedHtml(api)
workerPluginGetDiffs(api)

const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  if (!resolvers[requestType]) {
    throw new Error(`no resolver for request type "${requestType}"`)
  }
  return resolvers[requestType](params)
}

export const createLocalConnectionProxy: () => LocalConnectionProxy = () => ({
  sendRequest,
})
