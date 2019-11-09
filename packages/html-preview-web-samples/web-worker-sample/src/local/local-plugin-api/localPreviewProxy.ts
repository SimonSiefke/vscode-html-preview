import { PreviewProxy } from 'html-preview-web'

const $iframe = document.querySelector('iframe') as HTMLIFrameElement

const setHtml: PreviewProxy['setHtml'] = html => {
  $iframe.srcdoc = html
}

const sendMessage: PreviewProxy['sendMessage'] = message => {
  $iframe.contentWindow!.postMessage(message, '*')
}

export const createPreviewProxy: () => PreviewProxy = () => ({
  setHtml,
  sendMessage,
})
