import { RemotePlugin } from '../remotePluginApi'

const updateLink = ($link: HTMLLinkElement): Promise<void> => {
  return new Promise(resolve => {
    const newLink = $link.cloneNode() as HTMLLinkElement
    newLink.onload = () => {
      $link.remove()
      resolve()
    }
    newLink.href = $link.href.split('?')[0] + '?' + Date.now()
    $link.parentNode!.insertBefore(newLink, $link.nextSibling)
  })
}

export const updateCss: RemotePlugin = api => {
  api.webSocket.onMessage('updateCss', async () => {
    const $$links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
    await Promise.all($$links.map(updateLink))
    api.messageChannel.broadcastMessage('updatedCss', {})
  })
}
