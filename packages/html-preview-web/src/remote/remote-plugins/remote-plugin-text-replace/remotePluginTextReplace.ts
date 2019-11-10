import { createRequestType } from '../../../shared/requestType'
import { RemotePlugin } from '../remotePlugin'

const requestTypeTextReplace = createRequestType<{ id: number; text: string }, void>('textReplace')

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
export const remotePluginTextReplace: RemotePlugin = api => {
  api.connectionProxy.onRequest(requestTypeTextReplace, payload => {
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
