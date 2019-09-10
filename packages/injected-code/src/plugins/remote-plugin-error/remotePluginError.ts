import { RemotePlugin } from '../remotePluginApi'

export const remotePluginError: RemotePlugin = api => {
  api.webSocket.onMessage('error', payload => {
    alert('error' + payload.message)
  })
}
