import { RemoteConnectionProxy } from 'html-preview-web'

const listeners: {
  [method: string]: ((params: any) => any)[]
} = {}

const onRequest: RemoteConnectionProxy['onRequest'] = (requestType, listener) => {
  listeners[requestType] = listeners[requestType] || []
  listeners[requestType].push(listener)
}

onmessage = ({ data }) => {
  const commands = JSON.parse(data)
  for (const { command, payload } of commands) {
    if (!listeners[command]) {
      console.log(listeners)
      throw new Error(`no listener for command "${command}"`)
    }
    for (const listener of listeners[command]) {
      listener(payload)
    }
  }
}

export const createRemoteConnectionProxy: () => RemoteConnectionProxy = () => ({
  onRequest,
})
