import { ErrorResult } from 'virtual-dom'
import * as escapeHtml from 'escape-html'
import { CachedValue } from './extensionMain'

export const HTML_PREVIEW_JS = `const nodeTypeMap = {
  1: 'ElementNode',
  3: 'TextNode',
  8: 'CommentNode',
  9: 'ElementNode',
  10: 'Doctype'
}

const entityParsingNode = document.createElement('div')

/**
 *  Given a string containing encoded entity references, returns the string with the entities decoded.
 */
const parseEntities = text => {
  entityParsingNode.innerHTML = text
  return entityParsingNode.textContent
}

const $nodeMap = Object.create(null)

$nodeMap[-1] = document

const hydrate = (node, $node) => {
  if (node.nodeType !== nodeTypeMap[$node.nodeType]) {
    console.log(node)
    console.log($node)
    console.warn('hydration failed 1')
    return false
  }

  switch (node.nodeType) {
    case 'ElementNode': {
      if (node.tag !== $node.tagName.toLowerCase()) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 2')
        return false
      }

      if (node.id != $node.getAttribute('data-id')) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 3')
        return false
      }

      if (node.children.length !== $node.childNodes.length) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 4')
        return false
      }

      $node.removeAttribute('data-id')
      for (let i = 0; i < node.children.length; i++) {
        if (!hydrate(node.children[i], $node.childNodes[i])) {
          return false
        }
      }

      break
    }

    case 'TextNode': {
      if (parseEntities(node.text) !== $node.textContent) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 5')
        return false
      }

      break
    }

    case 'CommentNode': {
      // TODO
      break
    }

    default:
      break
  }

  $nodeMap[node.id] = $node
  return true
}

;(async () => {
  const result = JSON.parse(document.getElementById('virtual-dom').innerHTML)
  document.getElementById('virtual-dom').remove()
  document.getElementById('html-preview').remove()
  const success = result.nodes.every((node, i) => hydrate(node, document.childNodes[i]))
  if (!success) {
    return
  }
  window.$nodeMap = $nodeMap
  const webSocket = new WebSocket('ws://localhost:3000')
  webSocket.onerror = console.error
  webSocket.onmessage = ({ data }) => {
    const messages = JSON.parse(data)
    const movedIds = new Set()
    for (const { command, payload } of messages) {
      switch (command) {
        case 'textReplace': {
          const $node = $nodeMap[payload.id]
          if (!$node || nodeTypeMap[$node.nodeType] !== 'TextNode') {
            console.log({ command, payload })
            console.warn('failed to update text node')
            return
          }
          $node.textContent = parseEntities(payload.text)
          break
        }
        case 'elementInsert': {
          const $parent = $nodeMap[payload.parentId]
          if (!$parent || nodeTypeMap[$parent.nodeType] !== 'ElementNode') {
            console.log({ command, payload })
            console.warn('failed to insert node')
            return
          }
          let $node
          switch (payload.nodeType) {
            case 'ElementNode':
              $node = document.createElement(payload.tag)
              for (const [attributeName, attributeValue] of Object.entries(payload.attributes)) {
                $node.setAttribute(attributeName, attributeValue || '')
              }
              break
            case 'TextNode': {
              $node = document.createTextNode(parseEntities(payload.text))
              break
            }
            case 'CommentNode': {
              // TODO
              break
            }
            default: {
              break
            }
          }
          if(payload.index===0){
            $parent.prepend($node)
          } else {
            $parent.insertBefore($node, $parent.childNodes[payload.index])
          }
          $nodeMap[payload.id] = $node
          break
        }
        case 'elementMove': {
          const $parent = $nodeMap[payload.parentId]
          const $node = $nodeMap[payload.id]
          if (!$node || !$parent || nodeTypeMap[$parent.nodeType] !== 'ElementNode') {
            console.log({ command, payload })
            console.warn('failed to move node')
            return
          }
          if(payload.index === 0){
            $parent.prepend($node)
          } else {
            $parent.insertBefore($node, $parent.childNodes[payload.index])
          }
          movedIds.add(payload.id)
          break
        }
        case 'elementDelete': {
          if(movedIds.has(payload.id)){
            break
          }
          const $node = $nodeMap[payload.id]
          if(!$node){
            console.log({ command, payload })
            console.warn('failed to delete node')
            return
          }
          $node.parentNode.removeChild($node)
          delete $nodeMap[payload.id]
          break
        }
        case 'attributeAdd': {
          const $node = $nodeMap[payload.id]
          if(!$node){
            console.log({command, payload})
            console.warn('failed to add attribute for node')
            return
          }
          $node.setAttribute(payload.attributeName, payload.attributeValue || '')
          break
        }
        case 'attributeDelete':{
          const $node = $nodeMap[payload.id]
          if(!$node){
            console.log({command, payload})
            console.warn('failed to remove attribute for node')
            return
          }
          $node.removeAttribute(payload.attributeName)
          break
        }
        case 'attributeChange': {
          const $node = $nodeMap[payload.id]
          if(!$node){
            console.log({command, payload})
            console.warn('failed to change attributes for node')
            return
          }
          $node.setAttribute(payload.attributeName, payload.attributeValue || '')
          break
        }
        case 'reload':{
          window.location.reload(true)
          break
        }
        default: {
          console.log({ command, payload })
          console.warn('unhandled message')
          break
        }
      }
    }
  }
})()

`

export const ERROR_HTML = (previousText: string, result: ErrorResult) => {
  let errorSnippet: string
  if (result.index === -1) {
    errorSnippet = `<span style="color:red">${previousText}</span>`
  } else {
    errorSnippet = `${escapeHtml(
      previousText.slice(0, result.index - 1)
    )}<span style="color:red">${escapeHtml(
      previousText.slice(result.index - 1, result.index + 10)
    )}</span>${escapeHtml(previousText.slice(result.index + 10))}`
  }
  return `<!DOCTYPE html><html><head></head><body>
<h1>The HTML is invalid</h1>
<pre>
<code>
${errorSnippet}
</code>
</pre>
<script id="html-preview">
document.getElementById("html-preview").remove()
const webSocket = new WebSocket('ws://localhost:3000')
webSocket.onmessage = ({data}) => {
  const messages = JSON.parse(data)
  for(const {command, payload} of messages){
    switch (command) {
      case 'reload':
        window.location.reload(true)
        break;
      default:
        console.warn('unknown command'+command)
        break;
    }
  }
}
</script></body></html>`
}
