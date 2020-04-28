import { scan, TokenType } from './scanner2'

const SELF_CLOSING_TAGS = new Set(['input'])

const isSelfClosingTag: (tagName: string) => boolean = tagName => SELF_CLOSING_TAGS.has(tagName)

type SuccessResult = {
  readonly status: 'success'
}

type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
}

interface ElementNode {
  attributes: {
    [key: string]: string
  }
  children: (ElementNode | CommentNode | TextNode)[]
  parent: ElementNode | undefined
  tag: string
}

const createElementNode: () => ElementNode = () => ({
  attributes: {},
  children: [],
  nodeType: 'ElementNode',
  parent: undefined,
  tag: '',
})

interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly text: string
  readonly parent: ElementNode | undefined
}

const createCommentNode: (text: string) => CommentNode = text => ({
  text,
  nodeType: 'CommentNode',
  parent: undefined,
})

interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
  parent: ElementNode | undefined
}

const createTextNode: (text: string) => TextNode = text => ({
  nodeType: 'TextNode',
  text,
  parent: undefined,
})

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

  let child: any
  let attributeName: any
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    token
    switch (token.type) {
      case TokenType.Content: {
        child = createTextNode(token.text)
        parent.children.push(child)
        child = undefined
        break
      }
      case TokenType.StartTagOpeningBracket: {
        child = createElementNode()
        parent.children.push(child)
        break
      }
      case TokenType.StartTagName: {
        child.tag = token.text
        break
      }
      case TokenType.StartTagSelfClosingBracket: {
        child = undefined
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

      case TokenType.EndTagName: {
        // if (token.text === child.tag) {
        //   parent.children.push(child)
        //   child = undefined
        // }
        // token
        break
      }
      case TokenType.CommentStart: {
        // const start = tokens[i++]
        // const content = tokens[i++]
        // const end = tokens[i++]
        // initNode(createCommentNode(content.text))
      }
      case TokenType.AttributeName: {
        if (token.text in child.attributes) {
          return {
            status: 'invalid',
            index: -1,
          }
        }
        attributeName = token.text
        child.attributes[attributeName] = null
        break
      }
      case TokenType.AttributeValue: {
        child.attributes[attributeName] = token.text
        break
      }
      default: {
        break
      }
    }
  }
  return {
    status: 'success',
    htmlDocument,
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

const doc = parse(`<h1 class="">hello world</h1>`)

// @ts-ignore
JSON.stringify(pretty(doc.htmlDocument).children, null, 2) //?
