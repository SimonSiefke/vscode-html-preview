// import { RemotePlugin } from '../../remotePlugin'

// const removeChildren = ($node: Node) => {
//   while ($node.lastChild) {
//     if (isHeadOrBody($node.lastChild)) {
//       removeChildren($node.lastChild)
//     } else {
//       $node.removeChild($node.lastChild)
//     }
//   }
// }

// const remotePluginCoreElementDelete: RemotePlugin = api => {
//   api.connectionProxy.onRequest<{ id: number }, void>('elementDelete', payload => {
//     const deleteFromNodeMap = () => {
//       const $node = api.nodeMap[payload.id]
//       delete api.nodeMap[payload.id]
//       // api.messageChannel.broadcastMessage('elementDeleted', { id: payload.id, element: $node })
//     }
//     const $node = api.nodeMap[payload.id]
//     // @ts-ignore
//     if ($node.tagName && ['HTML', 'HEAD', 'BODY'].includes($node.tagName)) {
//       // cannot delete those, but need to remove their children
//       removeChildren($node)
//       deleteFromNodeMap()
//       return
//     }

//     if (!$node) {
//       debugger
//     }

//     // @ts-ignore
//     if ($node.remove) {
//       // @ts-ignore
//       $node.remove()
//     } else if ($node.parentNode && $node.parentNode.removeChild) {
//       $node.parentNode.removeChild($node)
//     }
//     deleteFromNodeMap()
//   })
// }

// const remotePluginCoreElementInsert: RemotePlugin = api => {
//   api.webSocket.onMessage('elementInsert', payload => {
//     let $node: Node
//     const addToNodeMap = ($node: Node) => {
//       api.nodeMap[payload.id] = $node
//       api.messageChannel.broadcastMessage('elementInserted', {
//         element: $node,
//         id: payload.id,
//       })
//     }
//     if (payload.nodeType === 'ElementNode') {
//       const tag = payload.tag.toLowerCase()
//       if (tag === 'html') {
//         addToNodeMap(document.documentElement)
//         return
//       }

//       if (tag === 'body') {
//         addToNodeMap(document.body)
//         return
//       }

//       if (tag === 'head') {
//         addToNodeMap(document.head)
//         return
//       }

//       if (tag === '!doctype') {
//         $node = document.implementation.createDocumentType('html', '', '')
//       } else {
//         $node = document.createElement(payload.tag) as HTMLElement
//         for (const [attributeName, attributeValue] of Object.entries<any>(payload.attributes)) {
//           ;($node as HTMLElement).setAttribute(attributeName, fixAttributeValue(attributeValue))
//         }

//         // $node.setAttribute('data-id', `${payload.id}`)
//       }
//     } else if (payload.nodeType === 'TextNode') {
//       $node = document.createTextNode(parseEntities(payload.text))
//     } else if (payload.nodeType === 'CommentNode') {
//       $node = document.createComment(parseEntities(payload.text))
//     } else {
//       // @debug
//       throw new Error('invalid node type')
//     }

//     addToNodeMap($node)
//     let $parent = api.nodeMap[payload.parentId] as HTMLElement
//     if (!$parent) {
//       debugger
//     }

//     if (
//       payload.parentId === 0 &&
//       !(payload.nodeType === 'CommentNode' || ['html', 'head', 'body'].includes(payload.tag))
//     ) {
//       $parent = document.body
//       for (const rootNode of api.virtualDom) {
//         const rootNodeParent = api.nodeMap[rootNode.id] && api.nodeMap[rootNode.id].parentNode
//         if (rootNodeParent === document) {
//           payload.beforeId--
//         } else {
//           break
//         }
//       }
//     }

//     console.log($parent)
//     if (payload.beforeId === 0) {
//       console.log('prepend')
//       $parent.prepend($node)
//     } else {
//       const $referenceNode = api.nodeMap[payload.beforeId]
//       // @debug
//       if (!$referenceNode) {
//         console.log(payload.beforeId)
//         console.log(api.nodeMap)
//         console.error(
//           `failed to insert new element because reference node with id ${payload.beforeId} does not exist`
//         )
//         return
//       }

//       $parent.insertBefore($node, $referenceNode.nextSibling)
//     }
//   })
// }

// const remotePluginCoreElementMove: RemotePlugin = api => {
//   api.connectionProxy.onRequest<{ id: number; parentId: number; beforeId: number }, void>(
//     'elementMove',
//     payload => {
//       console.log('elemetn move')
//       const $node = api.nodeMap[payload.id] as HTMLElement | Text | Comment | DocumentType
//       console.log($node)
//       let $parent = api.nodeMap[payload.parentId] as HTMLElement
//       if (!$parent) {
//         debugger
//       }

//       if (payload.parentId === 0) {
//         $parent = document.body
//         for (const rootNode of api.virtualDom) {
//           const rootNodeParent = api.nodeMap[rootNode.id] && api.nodeMap[rootNode.id].parentNode
//           if (rootNodeParent === document) {
//             payload.beforeId--
//           } else {
//             break
//           }
//         }
//       }

//       console.log($parent)
//       if (payload.beforeId === 0) {
//         console.log('prepend')
//         $parent.prepend($node)
//       } else {
//         const $referenceNode = api.nodeMap[payload.beforeId]
//         // @debug
//         if (!$referenceNode) {
//           console.log(payload.beforeId)
//           console.log(api.nodeMap)
//           console.error(
//             `failed to insert new element because reference node with id ${payload.beforeId} does not exist`
//           )
//           return
//         }
//         console.log('ref', $referenceNode)
//         $parent.insertBefore($node, $referenceNode.nextSibling)
//       }
//     }
//   )
// }
