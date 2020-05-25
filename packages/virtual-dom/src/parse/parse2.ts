import { scan, TokenType, Token } from './scanner2'
import assert from 'assert'
import { updateOffsetMap } from './updateOffsetMap'
import {
  isHeadTag,
  isAllowedSelfClosingTag,
  isSelfClosingTag,
  isBodyTag,
  isAutoClosed,
  isAutoClosedAtEnd,
} from './utils'

interface ElementNode {
  attributes: {
    [key: string]: string
  }
  children: (ElementNode | CommentNode | TextNode)[]
  readonly tag: string
  readonly id: string | number
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

const createElementNode: (tag: string, id: string | number) => ElementNode = (tag, id) => ({
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

export type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
  readonly reason?: string
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
  let html: ElementNode | undefined
  let head: ElementNode | undefined
  let body: ElementNode | undefined

  let implicitHtml: ElementNode | undefined
  let implicitHead: ElementNode | undefined
  let implicitBody: ElementNode | undefined

  let state:
    | 'root'
    | 'insideHtml'
    | 'afterHtml'
    | 'insideHead'
    | 'afterHead'
    | 'insideBody'
    | 'afterBody' = 'root'

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
        switch (state) {
          case 'root': {
            if (token.text.trim()) {
              // implicit html, implicit head, implicit body, node
              implicitHtml = createElementNode('html', 'html')
              parent.children.push(implicitHtml)
              html = implicitHtml
              implicitHead = createElementNode('head', 'head')
              html.children.push(implicitHead)
              head = implicitHead
              implicitBody = createElementNode('body', 'body')
              html.children.push(implicitBody)
              parent = implicitBody
              body = implicitBody
              parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
              state = 'insideBody'
            }
            break
          }
          case 'insideHtml': {
            if (token.text.trim()) {
              // implicit head, implicit body, node
              implicitHead = createElementNode('head', 'head')
              html!.children.push(implicitHead)
              head = implicitHead
              implicitBody = createElementNode('body', 'body')
              html!.children.push(implicitBody)
              parent = implicitBody
              body = implicitBody
              parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
              state = 'insideBody'
            }
            break
          }
          case 'insideHead': {
            if (parent === htmlDocument) {
              parent = head as ElementNode
            }
            if (parent === head) {
              if (token.text.trim()) {
                if (implicitHead) {
                  const whitespaceMatch = token.text.match(/^\s+/)
                  if (whitespaceMatch) {
                    const whitespaceText = whitespaceMatch[0]
                    // whitespace, implicit body, node
                    parent.children.push(
                      createTextNode(whitespaceText, getId(offset, whitespaceText.length))
                    )
                    implicitBody = createElementNode('body', 'body')
                    html!.children.push(implicitBody)
                    parent = implicitBody
                    body = implicitBody
                    parent.children.push(
                      createTextNode(
                        token.text.slice(whitespaceText.length),
                        getId(
                          offset + whitespaceText.length,
                          token.text.length - whitespaceText.length
                        )
                      )
                    )
                  } else {
                    // implicit body, node
                    implicitBody = createElementNode('body', 'body')
                    html!.children.push(implicitBody)
                    parent = implicitBody
                    body = implicitBody
                    parent.children.push(
                      createTextNode(token.text, getId(offset, token.text.length))
                    )
                  }
                  state = 'insideBody'
                } else {
                  return {
                    status: 'invalid',
                    index: findErrorIndex(i),
                    reason: `invalid text inside head ${text.slice(
                      findErrorIndex(i),
                      findErrorIndex(i) + 10
                    )}`,
                  }
                }
              } else {
                parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
              }
              break
            }
            // if (parent === implicitHead && token.text.trim()) {
            // }
            // if (parent === head && token.text.trim()) {
            //   return {
            //     status: 'invalid',
            //     index: findErrorIndex(i),
            //     reason: `invalid text inside head ${text.slice(
            //       findErrorIndex(i),
            //       findErrorIndex(i) + 10
            //     )}`,
            //   }
            // }
            if (parent === htmlDocument) {
              parent = head as ElementNode
            }
            parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
            break
          }
          case 'afterHead': {
            if (token.text.trim()) {
              const whitespaceMatch = token.text.match(/^\s+/)
              if (whitespaceMatch) {
                const whitespaceText = whitespaceMatch[0]
                // whitespace, implicit body, node
                parent.children.push(
                  createTextNode(whitespaceText, getId(offset, whitespaceText.length))
                )
                implicitBody = createElementNode('body', 'body')
                html!.children.push(implicitBody)
                parent = implicitBody
                body = implicitBody
                parent.children.push(
                  createTextNode(
                    token.text.slice(whitespaceText.length),
                    getId(offset + whitespaceText.length, token.text.length - whitespaceText.length)
                  )
                )
              } else {
                // implicit body, node
                implicitBody = createElementNode('body', 'body')
                html!.children.push(implicitBody)
                parent = implicitBody
                body = implicitBody
                parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
              }
              state = 'insideBody'
            } else {
              parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
            }
            break
          }
          case 'insideBody': {
            if (parent === htmlDocument || parent === html) {
              body!.children.push(createTextNode(token.text, getId(offset, token.text.length)))
            } else {
              parent.children.push(createTextNode(token.text, getId(offset, token.text.length)))
            }
            break
          }
          case 'afterBody': {
            if (token.text.trim()) {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            break
          }
          case 'afterHtml': {
            if (token.text.trim()) {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            break
          }
          default: {
            state
            throw new Error('invalid state')
          }
        }
        break
      }
      case TokenType.StartTagName: {
        switch (state) {
          case 'root': {
            if (token.text === 'html') {
              // explicit html
              child = createElementNode('html', 'html')
              stack.push(child)
              html = child
              state = 'insideHtml'
            } else if (token.text === 'head') {
              // implicit html, explicit head
              implicitHtml = createElementNode('html', 'html')
              parent.children.push(implicitHtml)
              html = implicitHtml
              parent = implicitHtml
              child = createElementNode('head', 'head')
              stack.push(child)
              head = child
              state = 'insideHead'
            } else if (token.text === 'body') {
              // implicit html, implicit head,  explicit body
              implicitHtml = createElementNode('html', 'html')
              parent.children.push(implicitHtml)
              html = implicitHtml
              parent = implicitHtml
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              head = implicitHead
              child = createElementNode('body', 'body')
              stack.push(child)
              body = child
              // parent = body as ElementNode
              state = 'insideBody'
            } else if (isHeadTag(token.text)) {
              // implicit html, implicit head, node
              implicitHtml = createElementNode('html', 'html')
              parent.children.push(implicitHtml)
              html = implicitHtml
              parent = implicitHtml
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              parent = implicitHead
              head = implicitHead
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
              state = 'insideHead'
            } else {
              // implicit html, implicit head, implicit body, node
              implicitHtml = createElementNode('html', 'html')
              parent.children.push(implicitHtml)
              html = implicitHtml
              parent = implicitHtml
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              head = implicitHead
              implicitBody = createElementNode('body', 'body')
              parent.children.push(implicitBody)
              parent = implicitBody
              body = implicitBody
              parent = body
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
              state = 'insideBody'
            }
            break
          }
          case 'insideHtml': {
            if (token.text === 'html') {
              // duplicate html tag
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            if (token.text === 'head') {
              // explicit head
              child = createElementNode('head', 'head')
              stack.push(child)
              head = child
              state = 'insideHead'
            } else if (token.text === 'body') {
              // implicit head, explicit body
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              head = implicitHead
              child = createElementNode('body', 'body')
              stack.push(child)
              body = child
              state = 'insideBody'
            } else if (isHeadTag(token.text)) {
              // implicit head, node
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              parent = implicitHead
              head = implicitHead
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
              state = 'insideHead'
            } else {
              // implicit head, implicit body, node
              implicitHead = createElementNode('head', 'head')
              parent.children.push(implicitHead)
              head = implicitHead
              implicitBody = createElementNode('body', 'body')
              parent.children.push(implicitBody)
              parent = implicitBody
              body = implicitBody
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
              state = 'insideBody'
            }
            break
          }
          case 'insideHead': {
            if (isHeadTag(token.text)) {
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
            } else {
              if (!implicitHead) {
                return {
                  status: 'invalid',
                  index: findErrorIndex(i),
                }
              }
              parent = html as ElementNode
              if (token.text === 'html' || token.text === 'head') {
                return {
                  status: 'invalid',
                  index: findErrorIndex(i),
                }
              }
              if (token.text === 'body') {
                // explicit body
                child = createElementNode('body', 'body')
                stack.push(child)
                body = child
                state = 'insideBody'
              } else {
                // implicit body, node
                implicitBody = createElementNode('body', 'body')
                parent.children.push(implicitBody)
                parent = implicitBody
                body = implicitBody
                child = createElementNode(token.text, getId(offset - 1, token.text.length))
                stack.push(child)
                state = 'insideBody'
              }
            }

            break
          }
          case 'afterHead': {
            if (token.text === 'body') {
              // explicit body
              child = createElementNode('body', 'body')
              stack.push(child)
              body = child
              state = 'insideBody'
            } else if (isHeadTag(token.text) || token.text === 'html' || token.text === 'head') {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            } else {
              // implicit body, node
              implicitBody = createElementNode('body', 'body')
              parent.children.push(implicitBody)
              parent = implicitBody
              body = implicitBody
              child = createElementNode(token.text, getId(offset - 1, token.text.length))
              stack.push(child)
              state = 'insideBody'
            }
            break
          }
          case 'insideBody': {
            if (
              !isBodyTag(token.text) ||
              token.text === 'html' ||
              token.text === 'body' ||
              token.text === 'head'
            ) {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            while (isAutoClosed(parent.tag, token.text)) {
              stack.pop()
              parent = stack[stack.length - 1]
            }
            const id = getId(offset - 1, token.text.length)
            if (parent.tag === 'table' && token.text === 'tr') {
              const implicitTbody = createElementNode('tbody', `tbody-${id}`)
              parent.children.push(implicitTbody)
              parent = implicitTbody
              stack.push(implicitTbody)
            }
            child = createElementNode(token.text, id)
            stack.push(child)
            break
          }
          default: {
            throw new Error('invalid state')
          }
        }
        break
      }
      case TokenType.DocType: {
        if (state !== 'root' || html) {
          return {
            status: 'invalid',
            index: findErrorIndex(i),
          }
        }
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
        switch (state) {
          case 'insideHead': {
            if (token.text === parent.tag) {
              if (token.text === 'head') {
                stack.pop()
                parent = html as ElementNode
                state = 'afterHead'
              } else {
                stack.pop()
                parent = stack[stack.length - 1]
              }
            } else if (token.text === 'html' && parent === implicitHead) {
              stack.pop()
              parent = html as ElementNode
            } else {
              throw new Error('no')
            }
            break
          }
          case 'insideBody': {
            if (token.text === parent.tag) {
              if (token.text === 'body') {
                stack.pop()
                parent = html as ElementNode
                state = 'afterBody'
              } else {
                stack.pop()
                parent = stack[stack.length - 1]
                if (parent === htmlDocument) {
                  parent = body as ElementNode
                }
              }
            } else if (token.text === 'html' && implicitBody && !implicitHtml) {
              stack.pop()
              parent = stack[stack.length - 1]
            } else {
              while (isAutoClosedAtEnd(parent.tag) && parent !== implicitBody) {
                stack.pop()
                parent = stack[stack.length - 1]
              }
              if (token.text === parent.tag) {
                stack.pop()
                parent = stack[stack.length - 1]
                if (parent === htmlDocument) {
                  parent = body as ElementNode
                }
              } else {
                return {
                  status: 'invalid',
                  index: findErrorIndex(i),
                }
              }
            }
            break
          }
          case 'afterBody': {
            if (token.text === parent.tag) {
              if (token.text === 'html') {
                stack.pop()
                parent = html as ElementNode
                state = 'afterHtml'
              } else {
                stack.pop()
                parent = stack[stack.length - 1]
              }
            } else {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            break
          }
          case 'afterHead': {
            if (token.text === parent.tag && token.text === 'html') {
              stack.pop()
              parent = htmlDocument
              state = 'afterHtml'
            } else {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            break
          }
          case 'insideHtml': {
            if (token.text === parent.tag && token.text === 'html') {
              stack.pop()
              parent = htmlDocument
              state = 'afterHtml'
            } else {
              return {
                status: 'invalid',
                index: findErrorIndex(i),
              }
            }
            break
          }
          default: {
            throw new Error('invalid state')
          }
        }
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
          console.log('attr')
          return {
            status: 'invalid',
            index: findErrorIndex(i),
          }
        }
        const attributeName = token.text
        let nextToken = tokens[++i]
        if (nextToken.type === TokenType.Whitespace) {
          offset += nextToken.text.length
          nextToken = tokens[++i]
        }
        if (nextToken.type === TokenType.AttributeEqualSign) {
          offset += nextToken.text.length
          nextToken = tokens[++i]
          if (nextToken.type === TokenType.Whitespace) {
            offset += nextToken.text.length
            nextToken = tokens[++i]
          }
          if (nextToken.type === TokenType.AttributeValue) {
            offset += nextToken.text.length
            child.attributes[attributeName] = nextToken.text
          } else if (nextToken.type === TokenType.QuotedAttributeValue) {
            offset += nextToken.text.length
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

  if (offset !== text.length) {
    throw new Error('parsing error')
  }

  if (stack[stack.length - 1] === implicitHead) {
    stack.pop()
  }
  if (!html) {
    html = createElementNode('html', 'html')
    htmlDocument.children.push(html)
  }
  if (!head) {
    html.children.push(createElementNode('head', 'head'))
  }
  if (!body) {
    html.children.push(createElementNode('body', 'body'))
  }
  if (isAutoClosedAtEnd(parent.tag)) {
    stack.pop()
    parent = stack[stack.length - 1]
  }
  if (stack[stack.length - 1] === implicitBody) {
    stack.pop()
  }
  if (stack[stack.length - 1] === implicitHtml) {
    stack.pop()
  }
  if (stack.length > 1) {
    stack
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

const stringifyNode = (node: ElementNode | TextNode | CommentNode | DoctypeNode) => {
  switch (node.nodeType) {
    case 'ElementNode':
      return `<${node.tag}${Object.entries(node.attributes)
        .map(([key, value]) => (value === null ? ` ${key}` : ` ${key}="${value}"`))
        .join('')}>${stringify(node.children)}${isSelfClosingTag(node.tag) ? '' : `</${node.tag}>`}`
    case 'TextNode':
      return node.text
    case 'Doctype':
      return `<!DOCTYPE html>`
    case 'CommentNode':
      return `<!--${node.text}-->`
  }
}
const stringify = nodes => {
  return nodes.map(stringifyNode).join('')
}

// const fs = require('fs')
// let doc: SuccessResult | ErrorResult

// doc = parse(
//   fs.readFileSync(`${__dirname}/fixture.txt`).toString(),
//   (() => {
//     let i = 0
//     return () => i++
//   })()
// )

const doc = parse(
  `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <input
        type="text"
        aria-haspopup="true"
        aria-autocomplete="list"
        aria-activedescendant="JavaScript"
      />
      <ul id="completions" role="listbox" aria-expanded="true">
        <li role="option" aria-selected="true" id="JavaScript">JavaScript</li>
        <li role="option" id="TypeScript">TypeScript</li>
      </ul>
      <!-- <script>
        const completions = ['JavaScript', 'TypeScript']
        const $completions = document.getElementById('completions')
        const create$Completion = (completion) => {
          const $completion = document.createElement('li')
          $completion.textContent = completion
          return $completion
        }
        for (const completion of completions) {
          $completions.append(create$Completion(completion))
        }
      </script> -->
    </body>
  </html>
  `,
  (() => {
    let i = 0
    return () => i++
  })()
)

if (doc.status === 'success') {
  JSON.stringify(doc.nodes) //?
  stringify(doc.nodes) //?
} else {
  doc.index //?
  doc.reason //?
  // console.log('fail')
}
