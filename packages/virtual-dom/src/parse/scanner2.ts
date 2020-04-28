const enum State {
  Content = 'Content',
  AfterStartTagOpeningBracket = 'AfterStartTagOpeningBracket',
  InsideStartTag = 'InsideStartTag',
  AfterEndTagOpeningBracket = 'AfterEndTagOpeningBracket',
  AfterEndTagName = 'AfterEndTagName',
  Comment = 'Comment',
  AfterAttributeName = 'AfterAttributeName',
  AfterAttributeEqualSign = 'AfterAttributeEqualSign',
  AfterOpeningDoubleQuote = 'AfterOpeningDoubleQuote',
  AfterAttributeValue = 'AfterAttributeValue',
  AfterOpeningSingleQuote = 'AfterOpeningSingleQuote',
  AfterClosingSingleQuote = 'AfterClosingSingleQuote',
  InsideStartTagAndHasSeenWhitespace = 'InsideStartTagAndHasSeenWhitespace',
}

export enum TokenType {
  StartTagName = 'StartTagName',
  Whitespace = 'Whitespace',
  EndTagOpeningBracket = 'EndTagOpeningBracket',
  Content = 'Content',
  EndTagName = 'EndTagName',
  CommentStart = 'CommentStart',
  CommentEnd = 'CommentEnd',
  StartTagSelfClosingBracket = 'StartTagSelfClosingBracket',
  StartTagClosingBracket = 'StartTagClosingBracket',
  StartTagOpeningBracket = 'StartTagOpeningBracket',
  AttributeName = 'AttributeName',
  AttributeEqualSign = 'AttributeEqualSign',
  OpeningDoubleQuote = 'OpeningDoubleQuote',
  ClosingDoubleQuote = 'ClosingDoubleQuote',
  OpeningSingleQuote = 'OpeningSingleQuote',
  ClosingSingleQuote = 'ClosingSingleQuote',
  AttributeValue = 'AttributeValue',
  DocType = 'DocType',
  Comment = 'Comment',
  Script = 'Script',
  ScriptEndTag = 'ScriptEndTag',
}

interface Token {
  readonly type: TokenType
  readonly text: string
}

const DOCTYPE_RE = /^!DOCTYPE\s+html/i
const TAG_NAME_RE = /^[a-zÀ-ž][a-zÀ-ž\d\-]*/i
const ATTRIBUTE_NAME_RE = /^[a-zÀ-ž][a-zÀ-ž\d\-:]*/i
const ATTRIBUTE_VALUE_SINGLE_QUOTE_RE = /^[^<>']+/
const ATTRIBUTE_VALUE_DOUBLE_QUOTE_RE = /^[^<>"]+/
const ATTRIBUTE_VALUE_RE = /^[^<>]/
const WHITESPACE_RE = /^\s+/

type SuccessResult = {
  readonly status: 'success'
  readonly tokens: readonly Token[]
}

type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
}

export const scan: (text: string) => SuccessResult | ErrorResult = text => {
  const tokens: Token[] = []
  let state: State = State.Content
  let index = 0
  let special: 'script' | 'style' | undefined
  let next: RegExpMatchArray | null
  while (index < text.length) {
    state
    switch (state) {
      case State.Content: {
        switch (special) {
          case 'style': {
            if ((next = text.slice(index).match(/^((?:.|\s)*?)(?:<\/style>)/))) {
              const tokenText = next[1]
              index += tokenText.length
              tokens.push({
                type: TokenType.Content,
                text: tokenText,
              })
              state = State.Content
              special = undefined
            } else {
              return {
                status: 'invalid',
                index,
              }
            }
            break
          }
          case 'script': {
            if ((next = text.slice(index).match(/^((?:.|\s)*?)(?:<\/script>)/))) {
              const tokenText = next[1]
              index += tokenText.length
              tokens.push({
                type: TokenType.Content,
                text: tokenText,
              })
              state = State.Content
              special = undefined
            } else {
              return {
                status: 'invalid',
                index,
              }
            }
            break
          }
          case undefined: {
            if ((next = text.slice(index).match(/^<!--/))) {
              const tokenText = next[0]
              index += tokenText.length
              tokens.push({
                type: TokenType.CommentStart,
                text: tokenText,
              })
              state = State.Comment
            } else if ((next = text.slice(index).match(/^<\//))) {
              const tokenText = next[0]
              index += tokenText.length
              tokens.push({
                type: TokenType.EndTagOpeningBracket,
                text: tokenText,
              })
              state = State.AfterEndTagOpeningBracket
            } else if ((next = text.slice(index).match(/^</))) {
              const tokenText = next[0]
              index += tokenText.length
              tokens.push({
                type: TokenType.StartTagOpeningBracket,
                text: tokenText,
              })
              state = State.AfterStartTagOpeningBracket
            } else if ((next = text.slice(index).match(/^[^<>]+/))) {
              const tokenText = next[0]
              index += tokenText.length
              tokens.push({
                type: TokenType.Content,
                text: tokenText,
              })
              state = State.Content
            } else {
              return {
                status: 'invalid',
                index,
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
      case State.AfterStartTagOpeningBracket: {
        if ((next = text.slice(index).match(TAG_NAME_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagName,
            text: tokenText,
          })
          state = State.InsideStartTag
          if (tokenText === 'script' || tokenText === 'style') {
            special = tokenText
          }
        } else if ((next = text.slice(index).match(DOCTYPE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.DocType,
            text: tokenText,
          })
          state = State.InsideStartTag
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.InsideStartTag: {
        if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
          state = State.InsideStartTagAndHasSeenWhitespace
        } else if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterEndTagOpeningBracket: {
        if ((next = text.slice(index).match(TAG_NAME_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.EndTagName,
            text: tokenText,
          })
          state = State.AfterEndTagName
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterEndTagName: {
        if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.EndTagOpeningBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.Comment: {
        if ((next = text.slice(index).match(/^-->/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.CommentEnd,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(/^(.|\s)*?(?:-->)/))) {
          const tokenText = next[1]
          index += tokenText.length
          tokens.push({
            type: TokenType.Comment,
            text: tokenText,
          })
          state = State.Comment
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.InsideStartTagAndHasSeenWhitespace: {
        if ((next = text.slice(index).match(/^\/>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagSelfClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(ATTRIBUTE_NAME_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeName,
            text: tokenText,
          })
          state = State.AfterAttributeName
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterAttributeName: {
        if ((next = text.slice(index).match(/^=/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeEqualSign,
            text: tokenText,
          })
          state = State.AfterAttributeEqualSign
        } else if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
          state = State.AfterAttributeName
        } else if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(/^\/>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagSelfClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterAttributeEqualSign: {
        if ((next = text.slice(index).match(/^"/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.OpeningDoubleQuote,
            text: tokenText,
          })
          state = State.AfterOpeningDoubleQuote
        } else if ((next = text.slice(index).match(/^'/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.OpeningSingleQuote,
            text: tokenText,
          })
          state = State.AfterOpeningSingleQuote
        } else if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
          state = State.AfterAttributeEqualSign
        } else if ((next = text.slice(index).match(ATTRIBUTE_VALUE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeValue,
            text: tokenText,
          })
          state = State.AfterAttributeValue
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterOpeningSingleQuote: {
        if ((next = text.slice(index).match(/^'/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.ClosingSingleQuote,
            text: tokenText,
          })
          state = State.AfterClosingSingleQuote
        } else if ((next = text.slice(index).match(ATTRIBUTE_VALUE_SINGLE_QUOTE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeValue,
            text: tokenText,
          })
          state = State.AfterOpeningSingleQuote
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterClosingSingleQuote: {
        if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(/^\/>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagSelfClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
          state = State.InsideStartTagAndHasSeenWhitespace
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterOpeningDoubleQuote: {
        if ((next = text.slice(index).match(/^"/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.ClosingDoubleQuote,
            text: tokenText,
          })
          state = State.AfterAttributeValue
        } else if ((next = text.slice(index).match(ATTRIBUTE_VALUE_DOUBLE_QUOTE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeValue,
            text: tokenText,
          })
          state = State.AfterOpeningDoubleQuote
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterAttributeValue: {
        if ((next = text.slice(index).match(/^>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(/^\/>/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.StartTagSelfClosingBracket,
            text: tokenText,
          })
          state = State.Content
        } else if ((next = text.slice(index).match(WHITESPACE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.Whitespace,
            text: tokenText,
          })
          state = State.InsideStartTagAndHasSeenWhitespace
        } else {
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      default: {
        state
        throw new Error('invalid state')
      }
    }
  }
  return {
    status: 'success',
    tokens,
  }
}

// for (let i = 0; i < 100000; i++) {
//   scan(`<svg xml:space="preserve">`) //?.
// }

scan(`<h1 class>hello world</h1>`) //?
