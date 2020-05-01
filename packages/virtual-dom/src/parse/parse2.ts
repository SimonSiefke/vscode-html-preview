import { scan, TokenType, Token } from './scanner2'
import * as assert from 'assert'
import { updateOffsetMap } from './updateOffsetMap'

const SELF_CLOSING_TAGS = new Set([
  '!DOCTYPE',
  '!doctype',
  'input',
  'br',
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const isSelfClosingTag: (tagName: string) => boolean = tagName => SELF_CLOSING_TAGS.has(tagName)

const ALLOWED_SELF_CLOSING_TAGS = new Set([
  '!DOCTYPE',
  '!doctype',
  'input',
  'br',
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element
  'a',
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'color-profile',
  'defs',
  'desc',
  'discard',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotlight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'hatch',
  'hatchpath',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'mesh',
  'meshgradient',
  'meshpath',
  'meshrow',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'script',
  'set',
  'solidColor',
  'stop',
  'style',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'title',
  'tspan',
  'unknown',
  'use',
  'view',
])

const isAllowedSelfClosingTag: (tagName: string) => boolean = tagName =>
  ALLOWED_SELF_CLOSING_TAGS.has(tagName)

interface ElementNode {
  attributes: {
    [key: string]: string
  }
  children: (ElementNode | CommentNode | TextNode)[]
  readonly tag: string
  readonly id: number
  readonly nodeType: 'ElementNode'
}

interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly text: string
  readonly id: number
}

interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
  readonly id: number
}

const createElementNode: (tag: string, id: number) => ElementNode = (tag, id) => ({
  attributes: Object.create(null),
  children: [],
  nodeType: 'ElementNode',
  tag,
  id,
})

const createCommentNode: (text: string, id: number) => CommentNode = (text, id) => ({
  text,
  nodeType: 'CommentNode',
  id,
})

const createTextNode: (text: string, id: number) => TextNode = (text, id) => ({
  nodeType: 'TextNode',
  text,
  id,
})

interface DoctypeNode {
  readonly nodeType: 'Doctype'
  readonly tag: '!DOCTYPE'
}

const createDoctypeNode: () => DoctypeNode = () => ({ nodeType: 'Doctype', tag: '!DOCTYPE' })

export type SuccessResult = {
  readonly status: 'success'
  readonly nodes: readonly (ElementNode | CommentNode | TextNode)[]
  readonly nodeMap: {
    readonly [id: number]: ElementNode | CommentNode | TextNode
  }
}

type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
}

const walk: (
  node: ElementNode | CommentNode | TextNode,
  fn: (node: ElementNode | CommentNode | TextNode) => void
) => void = (node, fn) => {
  fn(node)
  if (node.nodeType === 'ElementNode') {
    for (const child of node.children) {
      walk(child, fn)
    }
  }
}

export const parse: (
  text: string,
  getId: (offset: number, tokenLength: number) => number
) => SuccessResult | ErrorResult = (text, getId) => {
  const result = scan(text)
  if (result.status === 'invalid') {
    return {
      status: 'invalid',
      index: result.index,
    }
  }
  const { tokens } = result
  const htmlDocument = createElementNode('root', -1)
  let parent: ElementNode = htmlDocument
  const stack = [parent]
  let child: any
  const findErrorIndex = (tokenIndex: number) =>
    tokens
      .slice(0, tokenIndex)
      .map(token => token.text)
      .join('').length
  let offset = 0
  for (let i = 0; i < tokens.length; i++) {
    if (stack.length === 0) {
      i
      tokens
        .slice(i, i + 10)
        .map(x => x.text)
        .join('') //?
    }
    assert(stack.length > 0)
    const token = tokens[i]

    switch (token.type) {
      case TokenType.Content: {
        assert(parent !== undefined)
        child = createTextNode(token.text, getId(offset, token.text.length))
        if (!parent) {
          i
          tokens.length //?
          tokens
            .slice(i)
            .map(x => x.text)
            .join('') //?
          stack
        }
        parent.children.push(child)
        break
      }
      case TokenType.StartTagName: {
        if (parent.tag === 'li' && token.text === 'li') {
          stack.pop() as ElementNode
          parent = stack[stack.length - 1]
        }
        child = createElementNode(token.text, getId(offset, token.text.length))
        stack.push(child)
        break
      }
      case TokenType.DocType: {
        parent.children.pop()
        child = createDoctypeNode()
        stack.push(child)
        break
      }
      case TokenType.StartTagSelfClosingBracket: {
        if (!isAllowedSelfClosingTag(child.tag)) {
          return {
            status: 'invalid',
            index: findErrorIndex(i),
          }
        }
        parent.children.push(child)
        stack.pop()
        assert(stack.length > 0)
        break
      }
      case TokenType.EndTagName: {
        const top = stack.pop() as ElementNode
        if (top.tag === 'li' && new Set(['ul', 'ol']).has(token.text)) {
          parent = stack.pop() as ElementNode
        }
        if (parent.tag === token.text) {
          parent = stack[stack.length - 1]
        } else if (parent.tag === 'li' && new Set(['ul', 'ol']).has(token.text)) {
          parent = stack.pop() as ElementNode
        } else {
          return {
            status: 'invalid',
            index: findErrorIndex(i),
          }
        }
        assert(stack.length > 0)
        break
      }
      case TokenType.StartTagClosingBracket: {
        if (isSelfClosingTag(child.tag)) {
          stack.pop()
          parent.children.push(child)
        } else {
          parent.children.push(child)
          parent = child
        }
        assert(stack.length > 0)
        break
      }

      case TokenType.Comment: {
        child = createCommentNode(token.text.slice(4, -3), getId(offset, token.text.length))
        parent.children.push(child)
        break
      }
      case TokenType.AttributeName: {
        if (token.text in child.attributes) {
          return {
            status: 'invalid',
            index: findErrorIndex(i),
          }
        }
        const attributeName = token.text
        let nextToken = tokens[++i]
        if (nextToken.type === TokenType.Whitespace) {
          nextToken = tokens[++i]
        }
        if (nextToken.type === TokenType.AttributeEqualSign) {
          nextToken = tokens[++i]
          if (nextToken.type === TokenType.Whitespace) {
            nextToken = tokens[++i]
          }
          if (nextToken.type === TokenType.AttributeValue) {
            child.attributes[attributeName] = nextToken.text
          } else if (nextToken.type === TokenType.QuotedAttributeValue) {
            child.attributes[attributeName] = nextToken.text.slice(1, -1) // TODO check if opening quote is more performant
          }
        } else if (nextToken.type === TokenType.AttributeName) {
          child.attributes[attributeName] = null
          i--
        } else {
          i--
          child.attributes[attributeName] = null
        }
        break
      }

      default: {
        break
      }
    }
    offset += token.text.length
  }
  if (stack.length > 1) {
    return {
      status: 'invalid',
      index: -1,
    }
  }
  const nodeMap = Object.create(null)
  for (const child of htmlDocument.children) {
    walk(child, node => {
      nodeMap[node.id] = node
    })
  }
  return {
    status: 'success',
    nodes: htmlDocument.children,
    nodeMap,
  }
}

const pretty = node => {
  if (node.nodeType === 'ElementNode') {
    return {
      tag: node.tag,
      children: node.children.map(pretty),
      id: node.id,
      attributes: node.attributes,
    }
  }

  return {
    nodeType: node.nodeType,
    text: node.text,
    id: node.id,
  }
}

let offsetMap = Object.create(null)

// let id = 0
// parse(`<h1>hello world</h1>`, offset => {
//   const nextId = id++
//   offsetMap[offset] = nextId
//   return nextId
// })
// offsetMap

// offsetMap = updateOffsetMap(offsetMap, [
//   {
//     inserted: 7,
//     deleted: 0,
//     offset: 4,
//   },
// ]) //?

// let newOffsetMap = Object.create(null)

// const doc2 = parse(`<h1><p></p>hello world</h1>`, offset => {
//   let nextId
//   if (offset in offsetMap) {
//     nextId = offsetMap[offset]
//   } else {
//     nextId = id++
//   }
//   newOffsetMap[offset] = nextId
//   return nextId
// })

// if (doc2.status === 'success') {
//   JSON.stringify(doc2.nodes, null, 2) //?
// }

// // const fs = require('fs')
// // const doc = parse(fs.readFileSync(`${__dirname}/fixture.txt`).toString(), 0) //?

// // fs.readFileSync(`${__dirname}/fixture.txt`)
// //   .toString()
// //   .slice(20694 - 1000, 20694 + 100) //?
// // const doc1 = parse(
// //   `<h1>hello world</h1>`,
// //   (() => {
// //     let id = 0
// //     return () => id++
// //   })()
// // )
// // if (doc1.status === 'success') {
// //   JSON.stringify(doc1.nodeMap, null, 2) //?
// // }

// // const doc2 = parse(
// //   `<h1><p></p>hello world</h1>`,
// //   (() => {
// //     let id = 0
// //     return () => id++
// //   })()
// // )

// // if (doc2.status === 'success') {
// //   JSON.stringify(doc2.nodeMap, null, 2) //?
// // }

// // export const edit: (
// //   result: SuccessResult,
// //   edits: readonly { readonly length: number; readonly offset: number }[]
// // ) => any = (result, edits) => {
// //   const newResult = scan('<h1><p></p>hello world</h1>')
// //   if (newResult.status === 'invalid') {
// //     return result
// //   }
// //   const { tokens } = newResult
// //   let offset = 0
// //   // const edit =
// //   for (let i = 0; i < tokens.length; i++) {
// //     const token = tokens[i]
// //     offset += token.text.length
// //     result.nodes //?
// //     // if(offset === )
// //   }
// //   offset
// // }

// // edit(parse(`<h1>hello world</h1>`, 0) as SuccessResult, [
// //   {
// //     offset: 4,
// //     length: 7,
// //   },
// // ]) //?

// // for (let i = 0; i < 1000; i++) {
// //   parse(`<h1>hello world</h1>`.repeat(20000), 0) //?.
// // }
