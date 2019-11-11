import { genDom } from 'html-preview-service/dist/genDom/genDom'
import { createParser } from 'html-preview-service/dist/createParser/createParser'
import { WorkerPlugin } from '../../workerPlugin'

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
  api.connectionProxy.onRequest<{ text: string }, string>(
    'html-preview/get-generated-html',
    ({ text }) => {
      api.state.parser = createParser()
      let { gen, dom } = genDom(text, api.state.parser)
      api.state.previousDom = api.state.parser.dom
      api.state.previousText = text
      api.state.previousNodeMap = api.state.parser.nodeMap
      const bodyIndex = gen.lastIndexOf('</body')
      const $script = api.$remoteScript
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
    }
  )
}
