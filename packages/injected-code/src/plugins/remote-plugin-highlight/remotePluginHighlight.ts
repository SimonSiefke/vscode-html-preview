import { addHighlight } from './highlight-service/highlightServiceMain'
import { RemotePlugin } from '../remotePluginApi'

export const remotePluginHighlight: RemotePlugin = api => {
  api.webSocket.onMessage('highlight', payload => {
    const { id } = payload
    const $node = api.nodeMap[id]
    addHighlight($node)
  })
}
