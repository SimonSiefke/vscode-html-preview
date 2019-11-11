import { PreviewProxy } from 'html-preview-web'

const $iframe = document.querySelector('iframe') as HTMLIFrameElement

const sendMessage: PreviewProxy['sendMessage'] = message => {
  $iframe.contentWindow!.postMessage(message, '*')
}

const setHtml: PreviewProxy['setHtml'] = html => {
  $iframe.srcdoc = html
}

export const previewProxy: PreviewProxy = {
  sendMessage,
  setHtml,
}
