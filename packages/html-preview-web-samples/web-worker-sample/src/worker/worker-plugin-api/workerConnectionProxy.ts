import {
  WorkerConnectionProxy,
  createWorkerConnectionProxy as _createWorkerConnectionProxy,
} from 'html-preview-web'

const resolvers: {
  [method: string]: (params: any) => any
} = {}

const onRequest: WorkerConnectionProxy['onRequest'] = (requestType, resolver) => {
  if (resolvers[requestType.method]) {
    throw new Error(`duplicate resolver for request type "${requestType.method}"`)
  }
  resolvers[requestType.method] = resolver
}

onmessage = ({ data }) => {
  const parsedData = JSON.parse(data)
  const { method, params } = parsedData.request
  if (!resolvers[method]) {
    throw new Error(`no resolver for request type "${method}"`)
  }
  try {
    const result = resolvers[method](params)
    postMessage(JSON.stringify({ result, error: null }))
  } catch (error) {
    postMessage(JSON.stringify({ result: null, error }))
  }
}

export const createWorkerConnectionProxy: () => WorkerConnectionProxy = () =>
  _createWorkerConnectionProxy({ onRequest })
