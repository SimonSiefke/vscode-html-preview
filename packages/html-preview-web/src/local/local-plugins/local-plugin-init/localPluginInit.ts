import { LocalPlugin } from '../localPlugin'
import { createRequestType } from '../../../shared/requestType'

const requestTypeGetGeneratedHtml = createRequestType<{ text: string }, string>(
  'html-preview/get-generated-html'
)

/**
 * Initializes the preview with the text from the editor.
 *
 * @param api - the local plugin api
 */
export const localPluginInit: LocalPlugin = async api => {
  const initialText = api.editorProxy.getText()
  const initialHtml = await api.connectionProxy.sendRequest(requestTypeGetGeneratedHtml, {
    text: initialText,
  })
  await api.previewProxy.setHtml(initialHtml)
}
