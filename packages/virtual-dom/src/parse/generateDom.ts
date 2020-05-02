import { SuccessResult } from './parse2'
import { ElementNode, TextNode, CommentNode, DoctypeNode } from '../diff/diff2'
import { isSelfClosingTag } from './utils'

const generateNode = (node: ElementNode | TextNode | CommentNode | DoctypeNode) => {
  switch (node.nodeType) {
    case 'ElementNode':
      return `<${node.tag}${Object.entries(node.attributes)
        .map(([key, value]) => (value === null ? ` ${key}` : ` ${key}="${value}"`))
        .join('')} data-id="${node.id}">${generateNodes(node.children)}${
        isSelfClosingTag(node.tag) ? '' : `</${node.tag}>`
      }`
    case 'TextNode':
      return node.text
    case 'Doctype':
      return `<!DOCTYPE html>`
    case 'CommentNode':
      return `<!--${node.text}-->`
  }
}

const generateNodes = (nodes: readonly (ElementNode | TextNode | CommentNode | DoctypeNode)[]) => {
  return nodes.map(generateNode).join('')
}

export const generateDom = (result: SuccessResult) => {
  return generateNodes(result.nodes)
}
