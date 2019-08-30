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
    (value && (value.startsWith("'") && value.endsWith("'"))) ||
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

    $node.data = parseEntities(payload.text)
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
    const $node = api.nodeMap[payload.id]
    // @ts-ignore
    if ($node.tagName && ['HTML', 'HEAD', 'BODY'].includes($node.tagName)) {
      // cannot delete those, but need to remove their children
      removeChildren($node)
      delete api.nodeMap[payload.id]
      return
    }

    if (!$node) {
      debugger
    }

    // @ts-ignore
    if ($node.remove) {
      // @ts-ignore
      $node.remove()
    } else if ($node.parentNode && $node.parentNode.removeChild) {
      $node.parentNode.removeChild($node)
    }

    delete api.nodeMap[payload.id]
  })
}

const elementInsert: RemotePlugin = api => {
  api.webSocket.onMessage('elementInsert', payload => {
    let $node: HTMLElement | Text | Comment | DocumentType
    if (payload.nodeType === 'ElementNode') {
      const tag = payload.tag.toLowerCase()
      if (tag === 'html') {
        api.nodeMap[payload.id] = document.documentElement
        return
      }

      if (tag === 'body') {
        api.nodeMap[payload.id] = document.body
        return
      }

      if (tag === 'head') {
        api.nodeMap[payload.id] = document.head
        return
      }

      if (tag === '!doctype') {
        $node = document.implementation.createDocumentType('html', '', '')
      } else {
        $node = document.createElement(payload.tag) as HTMLElement
        for (const [attributeName, attributeValue] of Object.entries<any>(payload.attributes)) {
          $node.setAttribute(attributeName, fixAttributeValue(attributeValue))
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

    api.nodeMap[payload.id] = $node
    let $parent = api.nodeMap[payload.parentId] as HTMLElement
    if (!$parent) {
      debugger
    }

    if (
      payload.parentId === 0 &&
      !(payload.nodeType === 'CommentNode' || ['html', 'head', 'body'].includes(payload.tag))
    ) {
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

      $parent.insertBefore($node, $referenceNode.nextSibling)
    }
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

export const core = mergePlugins(
  textReplace,
  attributeChange,
  elementDelete,
  elementInsert,
  elementMove,
  attributeAdd,
  attributeDelete
)
