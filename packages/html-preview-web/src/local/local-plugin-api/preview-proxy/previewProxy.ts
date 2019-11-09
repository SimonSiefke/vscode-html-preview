import { Thenable } from '../../../shared/thenable'

export interface PreviewProxy {
  readonly setHtml: (html: string) => Thenable<void>
  readonly sendMessage: (message: string) => Thenable<void>
}

export const createPreviewProxy: () => PreviewProxy = () => {
  const $iframe = document.querySelector('iframe') as HTMLIFrameElement

  const setHtml: PreviewProxy['setHtml'] = html => {
    $iframe.srcdoc = html
  }

  const sendMessage: PreviewProxy['sendMessage'] = message => {
    $iframe.contentWindow!.postMessage(message, '*')
  }

  return {
    setHtml,
    sendMessage,
  }
}
