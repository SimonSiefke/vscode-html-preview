import { RemotePlugin } from '../../remotePlugin'

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

/**
 * Replaces the text inside a text node.
 *
 * @param api - the remote plugin api
 */
export const remotePluginCoreTextReplace: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; text: string }, void>('textReplace', payload => {
    const $node = api.nodeMap[payload.id] as Comment | Text
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
