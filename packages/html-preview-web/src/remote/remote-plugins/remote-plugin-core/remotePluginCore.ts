import { RemotePlugin } from '../remotePlugin'
import { mergePlugins } from '../../../shared/mergePlugins'
import { hydrate } from './hydrate'

const remotePluginCoreHydrate: RemotePlugin = api => {
  const $virtualDom = document.getElementById('nodeMap') as HTMLScriptElement
  const virtualDom = JSON.parse($virtualDom.innerHTML)
  const { nodeMap } = hydrate(virtualDom) as { nodeMap: any }
  api.nodeMap = nodeMap
  api.virtualDom = virtualDom
  document.querySelectorAll('[data-html-preview]').forEach($injectedNode => $injectedNode.remove())
}

const entityParsingNode = document.createElement('div')

/**
 *  Given a string containing encoded entity references, returns the string with the entities decoded.
 */
const parseEntities: (text: string) => string = text => {
  entityParsingNode.innerHTML = text
  return entityParsingNode.textContent as string
}

const fixAttributeValue: (value: string | null) => string = value => {
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

const remotePluginCoreTextReplace: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; text: string }, void>('textReplace', payload => {
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
    // console.log($node.data.replace(/ /g, 'SPACE'))
    // console.log(newData.replace(/ /g, 'SPACE'))
    if ($node.data.length !== newData.length) {
      // console.log('diff length')
      // console.log($node.data.length, newData.length)
    }
    // console.log($node.data === newData.slice(0, $node.data.length))
    // console.log(newData[newData.length - 1] === '\n')
    // console.log('different data')
    $node.data = newData
  })
}

const remotePluginCoreAttributeChange: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string; value: string }, void>(
    'attributeChange',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
    }
  )
}

const remotePluginCoreAttributeAdd: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string; value: string }, void>(
    'attributeAdd',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
    }
  )
}

const remotePluginCoreAttributeDelete: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string }, void>(
    'attributeDelete',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.removeAttribute(payload.attribute)
    }
  )
}

const remotePluginCoreElementDelete: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number }, void>('elementDelete', payload => {
    const deleteFromNodeMap = () => {
      const $node = api.nodeMap[payload.id]
      delete api.nodeMap[payload.id]
      // api.connectionProxy.broadcastMessage('elementDeleted', { id: payload.id, element: $node })
    }
    const $node = api.nodeMap[payload.id]
    // @ts-ignore
    if ($node.tagName && ['HTML', 'HEAD', 'BODY'].includes($node.tagName)) {
      // cannot delete those, but need to remove their children
      removeChildren($node)
      deleteFromNodeMap()
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
    deleteFromNodeMap()
  })
}

const remotePluginCoreElementInsert: RemotePlugin = api => {
  api.connectionProxy.onRequest<
    {
      id: number
      nodeType: string
      tag: string
      attributes: { [name: string]: string }
      text: string
      parentId: number
      beforeId: number
    },
    void
  >('elementInsert', payload => {
    let $node: Node
    const addToNodeMap = ($node: Node) => {
      api.nodeMap[payload.id] = $node
      // api.messageChannel.broadcastMessage('elementInserted', {
      //   element: $node,
      //   id: payload.id,
      // })
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

    // console.log($parent)
    if (payload.beforeId === 0) {
      // console.log('prepend')
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

const remotePluginCoreElementMove: RemotePlugin = api => {
  api.connectionProxy.onRequest<any, void>('elementMove', payload => {
    // console.log('elemetn move')
    const $node = api.nodeMap[payload.id] as HTMLElement | Text | Comment | DocumentType
    // console.log($node)
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

    // console.log($parent)
    if (payload.beforeId === 0) {
      // console.log('prepend')
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
      // console.log('ref', $referenceNode)
      $parent.insertBefore($node, $referenceNode.nextSibling)
    }
  })
}

export const remotePluginCore = mergePlugins(
  remotePluginCoreHydrate,
  remotePluginCoreTextReplace,
  remotePluginCoreAttributeChange,
  remotePluginCoreElementDelete,
  remotePluginCoreElementInsert,
  remotePluginCoreElementMove,
  remotePluginCoreAttributeAdd,
  remotePluginCoreAttributeDelete
)
