import { createParser, genDom } from 'html-preview-service'
import { WorkerPlugin } from '../workerPlugin'
import { createRequestType } from '../../../shared/requestType'

type Params = { text: string }
type Result = string
const requestTypeGetGeneratedHtml = createRequestType<Params, Result>(
  'html-preview/get-generated-html'
)

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
      if (!Array.isArray(value)) {
        return { ...value }
      }
    }
    return value
  }
}

export const workerPluginGetGeneratedHtml: WorkerPlugin = api => {
  api.connectionProxy.onRequest(requestTypeGetGeneratedHtml, ({ text }) => {
    api.state.parser = createParser()
    let { gen, dom } = genDom(text, api.state.parser)
    api.state.previousDom = api.state.parser.dom
    api.state.previousText = text
    api.state.previousNodeMap = api.state.parser.nodeMap
    const bodyIndex = gen.lastIndexOf('</body')
    const $script = '<script type="module" src="/dist/remoteMain.js"></script>'
    const $nodeMap = `<script id="nodeMap" type="application.json">${JSON.stringify(
      dom!.children!,
      getCircularReplacer(),
      2
    )}</script>`
    const $all = $nodeMap + '\n' + $script
    if (bodyIndex !== -1) {
      gen = gen.slice(0, bodyIndex) + $all + gen.slice(bodyIndex)
    } else {
      gen += $all
    }
    return gen
  })
}
