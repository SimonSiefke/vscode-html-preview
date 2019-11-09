import { LocalPlugin } from '../localPlugin'
import { createRequestType } from '../../../shared/requestType'
import { Edit } from '../../../shared/edit'

const requestTypeGetGeneratedHtml = createRequestType<{ text: string }, string>(
  'html-preview/get-generated-html'
)

const requestTypeGetDiffs = createRequestType<{ text: string; edits: Edit[] }, any[]>(
  'html-preview/get-diffs'
)

export const localPluginCore: LocalPlugin = async api => {
  const initialText = api.editorProxy.getText()
  const initialHtml = await api.localConnectionProxy.sendRequest(requestTypeGetGeneratedHtml, {
    text: initialText,
  })
  await api.previewProxy.setHtml(initialHtml)

  api.editorProxy.onDidChangeTextDocument(async text => {
    const edits: Edit[] = [
      {
        rangeOffset: 0,
        rangeLength: text.length,
        text,
      },
    ]
    const diffs = await api.localConnectionProxy.sendRequest(requestTypeGetDiffs, {
      text,
      edits,
    })
    await api.previewProxy.sendMessage(JSON.stringify(diffs))
  })
  // let previousDom
  // let previousText
  // let previousNodeMap
  // const parser = createParser()

  // const update = (newText, minimizedEdits) => {
  //   const oldNodeMap = previousNodeMap
  //   const { htmlDocument: nextDom } = parser.edit(newText, minimizedEdits)
  //   const newNodeMap = parser.nodeMap
  //   const diffs = diff(previousDom.children, nextDom!.children, { oldNodeMap, newNodeMap })
  //   previousDom = nextDom
  //   previousText = newText
  //   previousNodeMap = newNodeMap
  //   api.messageChannel.broadcastMessage(diffs)
  // }

  // api.editorProxy.onDidChangeTextDocument(newText => {
  //   if (!previousDom) {
  //     const parsingResult = parser.parse(newText)
  //     previousDom = parser.dom
  //     previousText = newText
  //     previousNodeMap = parser.nodeMap
  //     return
  //   }
  //   const edits = [
  //     {
  //       rangeOffset: 0,
  //       rangeLength: newText.length,
  //       text: newText,
  //     },
  //   ]
  //   const minimizedEdits = minimizeEdits(previousText, edits)
  //   update(newText, minimizedEdits)
  // })

  // @ts-ignore
  // update('<h1>hello world</h1>')

  // setTimeout(() => {
  //   update('<h1>hello world!</h1>', [
  //     {
  //       rangeOffset: 15,
  //       rangeLength: 0,
  //       text: '!',
  //     },
  //   ])
  // }, 1000)
}
