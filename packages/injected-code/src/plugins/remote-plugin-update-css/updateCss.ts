import { RemotePlugin } from '../remotePluginApi'

const updateLink = ($link: HTMLLinkElement) => {
  const newLink = $link.cloneNode() as HTMLLinkElement
  newLink.onload = () => $link.remove()
  newLink.href = $link.href.split('?')[0] + '?' + Date.now()
  $link.parentNode!.insertBefore(newLink, $link.nextSibling)
}

export const updateCss: RemotePlugin = api => {
  api.webSocket.onMessage('updateCss', () => {
    const $$links = document.querySelectorAll('link[rel="stylesheet"][href]')
    $$links.forEach(updateLink)
  })
}
