import { WorkerConnectionProxy } from '../../worker-plugin-api/worker-connection-proxy/workerConnectionProxy'

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
