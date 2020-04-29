import { scan, TokenType, Token } from './scanner2'

const SELF_CLOSING_TAGS = new Set(['input', '!DOCTYPE', '!doctype'])

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

const doc = parse(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr"  lang="en-US" >`)

// @ts-ignore
JSON.stringify(pretty(doc.htmlDocument).children, null, 2) //?
