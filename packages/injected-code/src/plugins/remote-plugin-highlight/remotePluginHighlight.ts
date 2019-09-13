import { addHighlights, updateHighlights } from './highlight-service/highlightServiceMain'
import { RemotePlugin } from '../remotePluginApi'

const isOutOfViewport = ($element: HTMLElement) => {
  const bounding = $element.getBoundingClientRect()

  const top = bounding.top < 0
  const left = bounding.left < 0
  const bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)
  const right = bounding.right > (window.innerWidth || document.documentElement.clientWidth)
  return top || left || bottom || right
}

const isVisible = ($node: HTMLElement) => window.getComputedStyle($node).display !== 'none'

export const remotePluginHighlight: RemotePlugin = api => {
  const messagesThatCauseLayoutChange = [
    'textReplace',
    'attributeChange',
    'attributeAdd',
    'attributeDelete',
    'elementDelete',
    'elementInsert',
    'elementMove',
  ]
  for (const messageThatCausesLayoutChange of messagesThatCauseLayoutChange) {
    api.webSocket.onMessage(messageThatCausesLayoutChange, updateHighlights)
  }

  window.addEventListener('resize', updateHighlights, { passive: true })

  api.webSocket.onMessage('highlightSelector', payload => {
    const { selector } = payload
    const $nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
    const $visibleNodes = $nodes.filter(isVisible)
    addHighlights($visibleNodes)
  })

  api.webSocket.onMessage('highlight', payload => {
    const { id } = payload
    const $node = api.nodeMap[id]
    if ($node === document.doctype) {
      return
    }
    if (!isVisible($node as HTMLElement)) {
      addHighlights([])
      return
    }
    // if (isOutOfViewport($node)) {
    //   $node.scrollIntoView({
    //     behavior: 'smooth',
    //   })
    // }
    addHighlights([$node as HTMLElement])
  })
}
