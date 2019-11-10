import { WorkerPlugin } from '../workerPlugin'
import { Edit } from '../../../shared/edit'
import { diff } from 'html-preview-service'

const minimizeEdits: (previousText: string, edits: readonly Edit[]) => Edit[] = (
  previousText,
  edits
) => {
  const newEdits: Edit[] = []
  for (const edit of edits) {
    const newEdit = {
      rangeOffset: edit.rangeOffset,
      rangeLength: edit.rangeLength,
      text: edit.text,
    }
    let same = 0
    for (let i = 0; i < edit.rangeLength; i++) {
      if (previousText[edit.rangeOffset + i] === edit.text[i]) {
        same++
      }
    }

    newEdit.rangeOffset += same
    newEdit.rangeLength -= same
    newEdit.text = newEdit.text.slice(same)
    if (newEdit.rangeLength === 0 && newEdit.text === '') {
      continue
    }

    newEdits.push(newEdit)
  }
  return newEdits
}

export const workerPluginGetDiffs: WorkerPlugin = api => {
  api.connectionProxy.onRequest<{ text: string; edits: Edit[] }, any>(
    'html-preview/get-diffs',
    ({ text, edits }) => {
      const minimizedEdits = minimizeEdits(text, edits)
      const oldNodeMap = api.state.previousNodeMap
      const { htmlDocument: nextDom } = api.state.parser.edit(text, minimizedEdits)
      const newNodeMap = api.state.parser.nodeMap
      const diffs = diff(api.state.previousDom.children, nextDom!.children, {
        oldNodeMap,
        newNodeMap,
      })
      api.state.previousDom = nextDom
      api.state.previousText = text
      api.state.previousNodeMap = newNodeMap
      return diffs
    }
  )
}
