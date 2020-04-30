import { scan, TokenType, Token } from './scanner2'

const SELF_CLOSING_TAGS = new Set(['input', '!DOCTYPE', '!doctype'])

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
        child = undefined
        break
      }
      case TokenType.StartTagOpeningBracket: {
        if (parent.tag === 'h1') {
          parent
        }
        child = createElementNode()
        parent.children.push(child)
        stack.push(child)
        break
      }
      case TokenType.StartTagName: {
        child.tag = token.text
        break
      }
      case TokenType.StartTagSelfClosingBracket: {
        child = undefined
        stack.pop()
        break
      }
      case TokenType.EndTagName: {
        if (parent.tag === token.text) {
          stack.pop()
          parent = stack[stack.length - 1]
        }
        break
      }
      case TokenType.StartTagClosingBracket: {
        if (isSelfClosingTag(child.tag)) {
          parent.children.push(child)
          child = undefined
        } else {
          parent = child
          child = undefined
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
        child = undefined
        break
      }
      case TokenType.AttributeName: {
        if (token.text in child.attributes) {
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
          child.attributes[attributeName] = null
        }
        break
      }

      default: {
        break
      }
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

const doc = parse(`<h1></h1><h2></h2>`)

// @ts-ignore
JSON.stringify(doc.nodes.map(pretty), null, 2) //?
