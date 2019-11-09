import { RemotePlugin } from '../remotePlugin'
import { hydrate } from './hydrate'

/**
 *  Given a string containing encoded entity references, returns the string with the entities decoded.
 */
const parseEntities = (() => {
  const entityParsingNode = document.createElement('div')
  return (text: string) => {
    entityParsingNode.innerHTML = text
    return entityParsingNode.textContent as string
  }
})()

export const remotePluginCore: RemotePlugin = api => {
  const $virtualDom = document.getElementById('nodeMap') as HTMLScriptElement
  const virtualDom = JSON.parse($virtualDom.innerHTML)
  const { nodeMap } = hydrate(virtualDom) as { nodeMap: any }

  api.messageChannel.onCommand('textReplace', payload => {
    const $node = nodeMap[payload.id] as Comment | Text
    if ($node === undefined) {
      console.error(`node ${payload.id} is undefined`)
      debugger
      return
    }

    const newData = parseEntities(payload.text)
    if ($node.data === newData) {
      return
    }
    $node.data = newData
  })
}
