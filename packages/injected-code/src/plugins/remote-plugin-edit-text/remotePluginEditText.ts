import { RemotePlugin } from '../remotePluginApi'

export const remotePluginEditText: RemotePlugin = api => {
  const reverseNodeMap = new Map<Node, number>()
  for (const [rawId, $node] of Object.entries(api.nodeMap)) {
    const id = parseInt(rawId, 10)
    reverseNodeMap.set($node, id)
  }
  api.messageChannel.onMessage('elementInserted', ({ id, element }) => {
    reverseNodeMap.set(element, id)
  })
  api.messageChannel.onMessage('elementDeleted', ({ id, element }) => {
    reverseNodeMap.delete(element)
  })

  const handleClick = (clickEvent: MouseEvent) => {
    if (!clickEvent.ctrlKey) {
      return
    }
    const $target = clickEvent.target as HTMLElement
    const $node = $target.childNodes[0] as HTMLElement
    if ($node.nodeType !== Node.TEXT_NODE) {
      return
    }
    $target.setAttribute('contenteditable', 'true')
    $target.style.whiteSpace = 'pre'
    $target.focus()
    let previousText = $target.innerText
    const handleInput = inputEvent => {
      const id = reverseNodeMap.get($node)
      const newText = $target.innerText
      api.webSocket.broadcastMessage('editText', { id, text: newText, previousText })
      previousText = newText
    }
    $target.addEventListener('input', handleInput)
    const cleanUp = () => {
      $target.removeEventListener('keydown', handleKeydown)
      $target.removeEventListener('input', handleInput)
      $target.removeAttribute('contenteditable')
      $target.removeEventListener('blur', cleanUp)
      // @ts-ignore
      $target.style.whiteSpace = null
    }
    const handleKeydown = (keyDownEvent: KeyboardEvent) => {
      if (keyDownEvent.key === 'Escape' || keyDownEvent.key === 'Enter') {
        cleanUp()
      }
    }
    $target.addEventListener('keydown', handleKeydown)
    $target.addEventListener('blur', cleanUp)
  }
  window.addEventListener('click', handleClick)
}
