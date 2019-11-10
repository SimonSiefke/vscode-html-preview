import { LocalPlugin } from '../localPlugin'
import { createRequestType } from '../../../shared/requestType'
import { Edit } from '../../../shared/edit'

const requestTypeGetDiffs = createRequestType<{ text: string; edits: Edit[] }, any[]>(
  'html-preview/get-diffs'
)

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
    const diffs = await api.connectionProxy.sendRequest(requestTypeGetDiffs, {
      text,
      edits,
    })
    await api.previewProxy.sendMessage(JSON.stringify(diffs))
  })
}
