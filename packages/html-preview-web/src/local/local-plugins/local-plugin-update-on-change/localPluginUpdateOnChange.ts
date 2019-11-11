import { LocalPlugin } from '../localPlugin'
import { Edit } from '../../../shared/edit'

/**
 * Updates the preview when the text inside the editor changes.
 *
 * @param api - the local plugin api
 */
export const localPluginUpdateOnChange: LocalPlugin = api => {
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
