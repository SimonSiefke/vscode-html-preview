import { scan, TokenType, Token } from './scanner2'

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

interface ElementNode {
  attributes: {
    [key: string]: string
  }
  children: (ElementNode | CommentNode | TextNode)[]
  tag: string
}

interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly text: string
}

interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
}

type SuccessResult = {
  readonly status: 'success'
  readonly nodes: readonly (ElementNode | CommentNode | TextNode)[]
}

type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
}

const createElementNode: () => ElementNode = () => ({
  attributes: Object.create(null),
  children: [],
  nodeType: 'ElementNode',
  tag: '',
})

const createCommentNode: (text: string) => CommentNode = text => ({
  text,
  nodeType: 'CommentNode',
})

const createTextNode: (text: string) => TextNode = text => ({
  nodeType: 'TextNode',
  text,
})

interface DoctypeNode {
  readonly nodeType: 'Doctype'
  readonly tag: '!DOCTYPE'
}

const createDoctypeNode: () => DoctypeNode = () => ({ nodeType: 'Doctype', tag: '!DOCTYPE' })

export const parse: (text: string) => SuccessResult | ErrorResult = text => {
  const result = scan(text)
  if (result.status === 'invalid') {
    console.error('error0')
    return {
      status: 'invalid',
      index: result.index,
    }
  }
  const { tokens } = result
  const htmlDocument = createElementNode()
  let parent: ElementNode = htmlDocument
  const stack = [parent]
  let child: any
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    switch (token.type) {
      case TokenType.Content: {
        child = createTextNode(token.text)
        parent.children.push(child)
        break
      }
      case TokenType.StartTagOpeningBracket: {
        child = createElementNode()
        stack.push(child)
        break
      }
      case TokenType.StartTagName: {
        const top = stack[stack.length - 1]
        if (top.tag === 'li') {
          top
        }
        child.tag = token.text
        break
      }
      case TokenType.StartTagSelfClosingBracket: {
        parent.children.push(child)
        stack.pop()
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
          parent.tag //?
          token.text //?
          // JSON.stringify(htmlDocument.children, null, 2) //?
          console.log('error3')
          return {
            status: 'invalid',
            index: -1,
          }
        }
        break
      }
      case TokenType.StartTagClosingBracket: {
        if (parent.tag === 'li' && child.tag === 'li') {
          stack.pop()
          stack.pop()
          parent = stack[stack.length - 1]
          parent.tag //?
          child
        }

        if (isSelfClosingTag(child.tag)) {
          stack.pop()
          parent.children.push(child)
        } else {
          parent.children.push(child)
          parent = child
        }
        break
      }
      case TokenType.DocType: {
        parent.children.pop()
        child = createDoctypeNode()
        break
      }
      case TokenType.Comment: {
        child = createCommentNode(token.text.slice(4, -3))
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
  return {
    status: 'success',
    nodes: htmlDocument.children,
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

const fs = require('fs')
// const doc = parse(fs.readFileSync(`${__dirname}/fixture.txt`).toString())

const doc = parse(`<div align="center"></div>
<hr>

<ul>
  <li>A collection of name/value pairs. In various languages, this is realized
    as an <i>object</i>, record, struct, dictionary, hash table, keyed list, or
    associative array.</li>
  <li>An ordered list of values. In most languages, this is realized as an <i>array</i>,
    vector, list, or sequence.</li>
</ul>


`)

if (doc.status !== 'invalid') {
  // @ts-ignore
  JSON.stringify(doc.nodes.map(pretty), null, 2) //?
} else {
  console.log('an error')
}
