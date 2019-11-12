import { WorkerPlugin } from '../workerPlugin'

export const workerPluginGetHighlights: WorkerPlugin = api => {
  let highlightedId: number | undefined

  api.connectionProxy.onRequest<{ selections: readonly Selection[] }, any>(
    'getHighlights',
    ({ selections }) => {
      if (api.state.error) {
        return []
      }
      const offset = selections[0][0]
      const parser = api.state.parser
      let found: number
      let previousValue

      if (!parser.nodeMap) {
        return []
      }

      for (const [key, value] of Object.entries(parser.prefixSums) as any[]) {
        const parsedKey = parseInt(key, 10)
        // @debug
        if (!parser.nodeMap[value]) {
          console.error(`highlight error, node ${value} doesn\'t exist`)
          continue
        }

        const isElementNode = parser.nodeMap[value].nodeType === 'ElementNode'

        if (parsedKey === offset && isElementNode) {
          found = value
          break
        }

        if (parsedKey > offset) {
          found = previousValue
          break
        }

        if (isElementNode) {
          previousValue = value
        }
      }

      // @ts-ignore
      if (!found) {
        found = previousValue
      }

      if (!found) {
        return []
      }

      if (highlightedId === found) {
        return []
      }
      highlightedId = found

      return [
        {
          command: 'highlight',
          payload: {
            id: found,
          },
        },
      ]
    }
  )
}
