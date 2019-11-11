import { LocalPlugin } from '../localPlugin'
import { Edit } from '../../../shared/edit'
import { mergePlugins } from '../../../shared/mergePlugins'

/**
 * Initializes the preview with the text from the editor.
 *
 * @param api - the local plugin api
 */
const localPluginInit: LocalPlugin = async api => {
  const initialText = api.editorProxy.getText()
  const initialHtml = await api.connectionProxy.sendRequest<{ text: string }, string>(
    'html-preview/get-generated-html',
    {
      text: initialText,
    }
  )
  await api.previewProxy.setHtml(initialHtml)
}

/**
 * Updates the preview when the text inside the editor changes.
 *
 * @param api - the local plugin api
 */
const localPluginCoreUpdateOnChange: LocalPlugin = api => {
  api.editorProxy.onDidChangeTextDocument(async text => {
    const edits: Edit[] = [
      {
        rangeOffset: 0,
        rangeLength: text.length,
        text,
      },
    ]
    const diffs = await api.connectionProxy.sendRequest<{ text: string; edits: Edit[] }, any[]>(
      'html-preview/get-diffs',
      {
        text,
        edits,
      }
    )
    if (diffs.length === 0) {
      return
    }
    await api.previewProxy.sendMessage(JSON.stringify(diffs))
  })
}

export const localPluginCore: LocalPlugin = mergePlugins(
  localPluginInit,
  localPluginCoreUpdateOnChange
)
