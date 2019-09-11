import { addHighlight } from './highlight-service/highlightServiceMain'
import { RemotePlugin } from '../remotePluginApi'

const isOutOfViewport = ($element: HTMLElement) => {
  const bounding = $element.getBoundingClientRect()

  const top = bounding.top < 0
  const left = bounding.left < 0
  const bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)
  const right = bounding.right > (window.innerWidth || document.documentElement.clientWidth)
  return top || left || bottom || right
}

export const remotePluginHighlight: RemotePlugin = api => {
  api.webSocket.onMessage('highlight', payload => {
    const { id } = payload
    const $node = api.nodeMap[id] as HTMLElement
    // if (isOutOfViewport($node)) {
    //   $node.scrollIntoView({
    //     behavior: 'smooth',
    //   })
    // }
    addHighlight($node)
  })
}
