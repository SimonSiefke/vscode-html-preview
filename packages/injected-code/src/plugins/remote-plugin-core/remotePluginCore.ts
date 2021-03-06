import { RemotePlugin, mergePlugins } from '../remotePluginApi'

/**
 *  Given a string containing encoded entity references, returns the string with the entities decoded.
 */
const parseEntities = (() => {
  const entityParsingNode = document.createElement('div')
  return (text: string) => {
    entityParsingNode.innerHTML = text
    return entityParsingNode.textContent as string
  }
})()

function fixAttributeValue(value: string | null) {
  if (value === null) {
    return ''
  }

  if (
    (value && value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1)
  }

  return value
}

const isHeadOrBody = ($node: Node): $node is HTMLHeadElement | HTMLBodyElement =>
  $node === document.head || $node === document.body

const removeChildren = ($node: Node) => {
  while ($node.lastChild) {
    if (isHeadOrBody($node.lastChild)) {
      removeChildren($node.lastChild)
    } else {
      $node.removeChild($node.lastChild)
    }
  }
}

const textReplace: RemotePlugin = api => {
  api.webSocket.onMessage('textReplace', payload => {
    const $node = api.nodeMap[payload.id] as Comment | Text
    if ($node === undefined) {
      console.error(`node ${payload.id} is undefined`)
      debugger
      return
    }

    const newData = parseEntities(payload.text)
    if ($node.data === newData) {
      return
    }
    console.log($node.data.replace(/ /g, 'SPACE'))
    console.log(newData.replace(/ /g, 'SPACE'))
    if ($node.data.length !== newData.length) {
      console.log('diff length')
      console.log($node.data.length, newData.length)
    }
    console.log($node.data === newData.slice(0, $node.data.length))
    console.log(newData[newData.length - 1] === '\n')
    console.log('different data')
    $node.data = newData
  })
}

const attributeChange: RemotePlugin = api => {
  api.webSocket.onMessage('attributeChange', payload => {
    const $node = api.nodeMap[payload.id] as HTMLElement
    $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
  })
}

const attributeAdd: RemotePlugin = api => {
  api.webSocket.onMessage('attributeAdd', payload => {
    const $node = api.nodeMap[payload.id] as HTMLElement
    $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
  })
}

const attributeDelete: RemotePlugin = api => {
  api.webSocket.onMessage('attributeDelete', payload => {
    const $node = api.nodeMap[payload.id] as HTMLElement
    $node.removeAttribute(payload.attribute)
  })
}

const elementDelete: RemotePlugin = api => {
  api.webSocket.onMessage('elementDelete', payload => {
    const $node = api.nodeMap[payload.id] as HTMLElement
    if (!$node) {
      throw new Error(`node doesn't exist`)
    }
    $node.remove()
    delete api.nodeMap[payload.id]
  })
}

const elementInsert: RemotePlugin = api => {
  api.webSocket.onMessage('elementInsert', payload => {
    let $node: Node
    const addToNodeMap = ($node: Node) => {
      api.nodeMap[payload.id] = $node
    }
    if (payload.nodeType === 'ElementNode') {
      const tag = payload.tag.toLowerCase()
      if (tag === 'html') {
        addToNodeMap(document.documentElement)
        return
      }

      if (tag === 'body') {
        addToNodeMap(document.body)
        return
      }

      if (tag === 'head') {
        addToNodeMap(document.head)
        return
      }

      if (tag === '!doctype') {
        $node = document.implementation.createDocumentType('html', '', '')
      } else {
        $node = document.createElement(payload.tag) as HTMLElement
        for (const [attributeName, attributeValue] of Object.entries<any>(payload.attributes)) {
          ;($node as HTMLElement).setAttribute(attributeName, fixAttributeValue(attributeValue))
        }

        // $node.setAttribute('data-id', `${payload.id}`)
      }
    } else if (payload.nodeType === 'TextNode') {
      $node = document.createTextNode(parseEntities(payload.text))
    } else if (payload.nodeType === 'CommentNode') {
      $node = document.createComment(parseEntities(payload.text))
    } else {
      // @debug
      throw new Error('invalid node type')
    }

    addToNodeMap($node)
    let $parent: HTMLElement
    if (payload.parentId === -1) {
      $parent = document.body
    } else {
      $parent = api.nodeMap[payload.parentId] as HTMLElement
    }
    $parent.insertBefore($node, $parent.children[payload.index])
  })
}

const elementMove: RemotePlugin = api => {
  api.webSocket.onMessage('elementMove', payload => {
    console.log('elemetn move')
    const $node = api.nodeMap[payload.id] as HTMLElement | Text | Comment | DocumentType
    console.log($node)
    let $parent = api.nodeMap[payload.parentId] as HTMLElement
    if (!$parent) {
      debugger
    }

    if (payload.parentId === 0) {
      $parent = document.body
      for (const rootNode of api.virtualDom) {
        const rootNodeParent = api.nodeMap[rootNode.id] && api.nodeMap[rootNode.id].parentNode
        if (rootNodeParent === document) {
          payload.beforeId--
        } else {
          break
        }
      }
    }

    console.log($parent)
    if (payload.beforeId === 0) {
      console.log('prepend')
      $parent.prepend($node)
    } else {
      const $referenceNode = api.nodeMap[payload.beforeId]
      // @debug
      if (!$referenceNode) {
        console.log(payload.beforeId)
        console.log(api.nodeMap)
        console.error(
          `failed to insert new element because reference node with id ${payload.beforeId} does not exist`
        )
        return
      }
      console.log('ref', $referenceNode)
      $parent.insertBefore($node, $referenceNode.nextSibling)
    }
  })
}

export const remotePluginCore = mergePlugins(
  textReplace,
  attributeChange,
  elementDelete,
  elementInsert,
  elementMove,
  attributeAdd,
  attributeDelete
)
