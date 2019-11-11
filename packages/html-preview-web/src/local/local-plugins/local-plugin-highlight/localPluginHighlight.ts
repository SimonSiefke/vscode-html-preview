import { LocalPlugin } from '../localPlugin'
import { Selection } from '../../../shared/selection'

export const localPluginHighlight: LocalPlugin = api => {
  api.editorProxy.onDidChangeSelection(async () => {
    const selections = api.editorProxy.getSelections()
    const commands = await api.connectionProxy.sendRequest<
      { selections: readonly Selection[] },
      any[]
    >('getHighlights', { selections })
    if (commands.length === 0) {
      return
    }
    await api.previewProxy.sendMessage(JSON.stringify(commands))
  })
}
