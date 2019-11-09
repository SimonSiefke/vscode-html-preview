import { RemotePlugin } from '../remotePlugin'
import { hydrate } from './hydrate'

export const remotePluginHydrate: RemotePlugin = api => {
  const $virtualDom = document.getElementById('nodeMap') as HTMLScriptElement
  const virtualDom = JSON.parse($virtualDom.innerHTML)
  const { nodeMap } = hydrate(virtualDom) as { nodeMap: any }
  api.nodeMap = nodeMap
}
