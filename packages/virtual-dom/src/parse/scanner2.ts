const enum State {
  Content = 'Content',
  AfterStartTagOpeningBracket = 'AfterStartTagOpeningBracket',
  InsideStartTag = 'InsideStartTag',
  AfterEndTagOpeningBracket = 'AfterEndTagOpeningBracket',
  AfterEndTagName = 'AfterEndTagName',
  Comment = 'Comment',
  AfterAttributeName = 'AfterAttributeName',
  AfterAttributeEqualSign = 'AfterAttributeEqualSign',
  InsideStartTagAndHasSeenWhitespace = 'InsideStartTagAndHasSeenWhitespace',
  AfterAttributeNameAndHasSeenWhitespace = 'AfterAttributeNameAndHasSeenWhitespace',
}

export enum TokenType {
  StartTagName = 'StartTagName',
  Whitespace = 'Whitespace',
  EndTagOpeningBracket = 'EndTagOpeningBracket',
  Content = 'Content',
  EndTagName = 'EndTagName',
  StartTagSelfClosingBracket = 'StartTagSelfClosingBracket',
  StartTagClosingBracket = 'StartTagClosingBracket',
  StartTagOpeningBracket = 'StartTagOpeningBracket',
  AttributeName = 'AttributeName',
  AttributeEqualSign = 'AttributeEqualSign',
  AttributeValue = 'AttributeValue',
  QuotedAttributeValue = 'QuotedAttributeValue',
  DocType = 'DocType',
  Comment = 'Comment',
  Script = 'Script',
  ScriptEndTag = 'ScriptEndTag',
}

export interface Token {
  readonly type: TokenType
  readonly text: string
}

const DOCTYPE_XHTML_STRICT_RE = /^!DOCTYPE\s+html\s+PUBLIC\s+"-\/\/W3C\/\/DTD XHTML 1.0 Strict\/\/EN"\s+"http:\/\/www.w3.org\/TR\/xhtml1\/DTD\/xhtml1-strict.dtd"/i
const DOCTYPE_HTML4_STRICT_RE = /!DOCTYPE\s+HTML\s+PUBLIC\s+"-\/\/W3C\/\/DTD HTML 4.01\/\/EN"\s+"http:\/\/www.w3.org\/TR\/html4\/strict.dtd"/i
const DOCTYPE_HTML4_TRANSITIONAL_RE = /!DOCTYPE\s+HTML\s+PUBLIC\s+"-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN"\s+"http:\/\/www.w3.org\/TR\/html4\/loose.dtd"/i
const DOCTYPE_HTML4_FRAMESET_RE = /!DOCTYPE\s+HTML\s+PUBLIC\s+"-\/\/W3C\/\/DTD HTML 4.01 Frameset\/\/EN"\s+"http:\/\/www.w3.org\/TR\/html4\/frameset.dtd"/i
const DOCTYPE_RE_5 = /!DOCTYPE\s+html/i
const TAG_NAME_RE = /^[a-zÀ-ž][a-zÀ-ž\d\-]*/i
const ATTRIBUTE_NAME_RE = /^[a-zÀ-ž][a-zÀ-ž\d\-:_]*/i
const ATTRIBUTE_VALUE_SINGLE_QUOTE_RE = /^'[^']*'/
const ATTRIBUTE_VALUE_DOUBLE_QUOTE_RE = /^"[^"]*"/
const ATTRIBUTE_VALUE_RE = /^[^<>\s]*/
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
            if ((next = text.slice(index).match(/^<!--(.|\s)*?-->/))) {
              const tokenText = next[0]
              index += tokenText.length
              tokens.push({
                type: TokenType.Comment,
                text: tokenText,
              })
              state = State.Content
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
        } else if (
          (next = text.slice(index).match(DOCTYPE_XHTML_STRICT_RE)) ||
          (next = text.slice(index).match(DOCTYPE_HTML4_FRAMESET_RE)) ||
          (next = text.slice(index).match(DOCTYPE_HTML4_STRICT_RE)) ||
          (next = text.slice(index).match(DOCTYPE_HTML4_TRANSITIONAL_RE)) ||
          (next = text.slice(index).match(DOCTYPE_RE_5))
        ) {
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
          state = State.AfterAttributeNameAndHasSeenWhitespace
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
          console.log('ok')
          tokens
          text.slice(index).startsWith('x') //?
          return {
            status: 'invalid',
            index,
          }
        }
        break
      }
      case State.AfterAttributeNameAndHasSeenWhitespace: {
        if ((next = text.slice(index).match(/^=/))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeEqualSign,
            text: tokenText,
          })
          state = State.AfterAttributeEqualSign
        } else if ((next = text.slice(index).match(ATTRIBUTE_NAME_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.AttributeName,
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
          tokens
          console.log(index)
          console.log(text.slice(index, index + 30))
          text.slice(index) //?
          throw new Error('no')
        }
        break
      }
      case State.AfterAttributeEqualSign: {
        if ((next = text.slice(index).match(ATTRIBUTE_VALUE_SINGLE_QUOTE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.QuotedAttributeValue,
            text: tokenText,
          })
          state = State.InsideStartTag
        } else if ((next = text.slice(index).match(ATTRIBUTE_VALUE_DOUBLE_QUOTE_RE))) {
          const tokenText = next[0]
          index += tokenText.length
          tokens.push({
            type: TokenType.QuotedAttributeValue,
            text: tokenText,
          })
          state = State.InsideStartTag
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
          state = State.InsideStartTag
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

scan(`<div aria-label="Add bold text <ctrl+b>">`) //?
