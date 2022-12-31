import { CommentNode, DoctypeNode, ElementNode, TextNode } from '../Diff/Diff'
import * as NodeType from '../NodeType/NodeType'
import type { SuccessResult } from '../parse/parse2'
import * as IsSelfClosingTag from '../IsSelfClosingTag/IsSelfClosingTag'
import * as EscapeHtml from '../EscapeHtml/EscapeHtml'

const stringify = (x: any) => {
  return JSON.stringify(x, (key, value) => {
    if (typeof value === 'object') {
      return value
    }
    return EscapeHtml.escapeHtml(value.toString())
  })
}

const generateElementNode = (node: ElementNode, result: SuccessResult) => {
  return `<${node.tag}${Object.entries(node.attributes)
    .map(([key, value]) => (value === null ? ` ${key}` : ` ${key}="${value}"`))
    .join('')} data-id="${node.id}">${generateNodes(node.children, result)}${
    node.tag === 'body'
      ? `<script id="virtual-dom" type="application/json">${stringify(
          result
        )}</script><script id="html-preview" type="module" src="http://localhost:3000/html-preview.js"></script>`
      : ''
  }${IsSelfClosingTag.isSelfClosingTag(node.tag) ? '' : `</${node.tag}>`}`
}

const generateTextNode = (node: TextNode) => {
  return node.text
}

const generateDocTypeNode = (node: DoctypeNode) => {
  return `<!DOCTYPE html>`
}

const generateCommentNode = (node: CommentNode) => {
  return `<!--${node.text}-->`
}

const generateNode = (
  node: ElementNode | TextNode | CommentNode | DoctypeNode,
  result: SuccessResult
) => {
  switch (node.nodeType) {
    case NodeType.ElementNode:
      return generateElementNode(node, result)
    case NodeType.TextNode:
      return generateTextNode(node)
    case NodeType.DocType:
      return generateDocTypeNode(node)
    case NodeType.CommentNode:
      return generateCommentNode(node)
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
