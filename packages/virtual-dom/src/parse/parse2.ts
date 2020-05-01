import { scan, TokenType, Token } from './scanner2'
import * as assert from 'assert'

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

type SuccessResult = {
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

export const parse: (text: string, initialId: number) => SuccessResult | ErrorResult = (
  text,
  initialId
) => {
  let id = initialId
  const result = scan(text)
  if (result.status === 'invalid') {
    console.error('error0')
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
        child = createTextNode(token.text, id++)
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
        child = createElementNode(token.text, id++)
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
          console.log('unmatched')
          tokens
            .slice(i, i + 20)
            .map(x => x.text)
            .join('') //?
          // JSON.stringify(htmlDocument.children, null, 2) //?
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
        child = createCommentNode(token.text.slice(4, -3), id++)
        parent.children.push(child)
        break
      }
      case TokenType.AttributeName: {
        if (token.text in child.attributes) {
          child.attributes //?
          token.text //?
          console.log('no')
          console.error('error1')
          return {
            status: 'invalid',
            index: -1,
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
  }
  if (stack.length > 1) {
    // JSON.stringify(htmlDocument.children, null, 2) //?
    console.error('error2')
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

// const fs = require('fs')
// const doc = parse(fs.readFileSync(`${__dirname}/fixture.txt`).toString(), 0) //?

// fs.readFileSync(`${__dirname}/fixture.txt`)
//   .toString()
//   .slice(20694 - 1000, 20694 + 100) //?
const doc = parse(
  ` <ul class="home-features">
  <li>
      <a href="/en-US/docs/Web" class="cta-link">
          Web Technologies<svg class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" aria-hidden="true">
<path d="M23 15a2.01 2.01 0 0 1-.578 1.422L12.25 26.594c-.375.359-.891.578-1.422.578s-1.031-.219-1.406-.578L8.25 25.422c-.375-.375-.594-.891-.594-1.422s.219-1.047.594-1.422L12.828 18h-11C.703 18 0 17.062 0 16v-2c0-1.062.703-2 1.828-2h11L8.25 7.406a1.96 1.96 0 0 1 0-2.812l1.172-1.172c.375-.375.875-.594 1.406-.594s1.047.219 1.422.594l10.172 10.172c.375.359.578.875.578 1.406z"/>
</svg>
      </a>
  </li>
  <li>
      <a href="/en-US/docs/Learn" class="cta-link">
          Learn web development<svg class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" aria-hidden="true">
<path d="M23 15a2.01 2.01 0 0 1-.578 1.422L12.25 26.594c-.375.359-.891.578-1.422.578s-1.031-.219-1.406-.578L8.25 25.422c-.375-.375-.594-.891-.594-1.422s.219-1.047.594-1.422L12.828 18h-11C.703 18 0 17.062 0 16v-2c0-1.062.703-2 1.828-2h11L8.25 7.406a1.96 1.96 0 0 1 0-2.812l1.172-1.172c.375-.375.875-.594 1.406-.594s1.047.219 1.422.594l10.172 10.172c.375.359.578.875.578 1.406z"/>
</svg>
      </a>
  </li>
  <li>
      <a href="/en-US/docs/Tools" class="cta-link">
          Developer Tools<svg class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" aria-hidden="true">
<path d="M23 15a2.01 2.01 0 0 1-.578 1.422L12.25 26.594c-.375.359-.891.578-1.422.578s-1.031-.219-1.406-.578L8.25 25.422c-.375-.375-.594-.891-.594-1.422s.219-1.047.594-1.422L12.828 18h-11C.703 18 0 17.062 0 16v-2c0-1.062.703-2 1.828-2h11L8.25 7.406a1.96 1.96 0 0 1 0-2.812l1.172-1.172c.375-.375.875-.594 1.406-.594s1.047.219 1.422.594l10.172 10.172c.375.359.578.875.578 1.406z"/>
</svg>
      </a>
  </li>
</ul>`,
  0
) //?
if (doc.status === 'success') {
  JSON.stringify(doc.nodeMap, null, 2) //?
}
