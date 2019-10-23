import { RemotePlugin } from '../remotePluginApi'

export const remotePluginHighlightSelection: RemotePlugin = api => {
  const selection = window.getSelection() as Selection
  api.webSocket.onMessage('highlightSelection', payload => {
    const $node = api.nodeMap[payload.nodeId]
    const range = document.createRange()
    range.setStart($node.firstChild!, payload.selectionOffset)
    range.setEnd($node.firstChild!, payload.selectionLength + payload.selectionOffset)
    selection.removeAllRanges()
    selection.addRange(range)
  })

  // setTimeout(() => {
  //   let range = new Range()
  //   const h1 = document.querySelector('h1')!

  //   range.setStart(h1.firstChild!, 2)
  //   range.setEnd(h1.firstChild!, 9)
  //   window.getSelection()!.addRange(range)
  // }, 1000)
}
