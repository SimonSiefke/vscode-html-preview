import { SuccessResult, parse } from './parse2'
import { ElementNode, TextNode, CommentNode, DoctypeNode } from '../diff/diff2'
import { isSelfClosingTag } from './utils'

const escapeHtml = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;')

const stringify = (x: any) =>
  JSON.stringify(x, (key, value) => {
    if (typeof value === 'object') {
      return value
    }
    return escapeHtml(value.toString())
  })

const generateNode = (
  node: ElementNode | TextNode | CommentNode | DoctypeNode,
  result: SuccessResult
) => {
  switch (node.nodeType) {
    case 'ElementNode': {
      return `<${node.tag}${Object.entries(node.attributes)
        .map(([key, value]) => (value === null ? ` ${key}` : ` ${key}="${value}"`))
        .join('')} data-id="${node.id}">${generateNodes(node.children, result)}${
        node.tag === 'body'
          ? `<script id="virtual-dom" type="application/json">${stringify(
              result
            )}</script><script id="html-preview" type="module" src="http://localhost:3000/html-preview.js"></script>`
          : ''
      }${isSelfClosingTag(node.tag) ? '' : `</${node.tag}>`}`
    }
    case 'TextNode':
      return node.text
    case 'Doctype':
      return `<!DOCTYPE html>`
    case 'CommentNode':
      return `<!--${node.text}-->`
  }
}

const generateNodes = (
  nodes: readonly (ElementNode | TextNode | CommentNode | DoctypeNode)[],
  result: SuccessResult
) => {
  return nodes.map(node => generateNode(node, result)).join('')
}

export const generateDom = (result: SuccessResult) => {
  return generateNodes(result.nodes, result)
}

const result = parse(
  `<h1>hello world</h1>`,
  (() => {
    let id = 0
    return () => id++
  })()
) as SuccessResult

generateDom(result) //?
