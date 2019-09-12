type TokenType = 'selector' | 'open' | 'close' | 'between'

interface Token {
  type: TokenType
  value: string
  offset: number
}

/**
 * Compute an array of CSS tokens for a given CSS source code.
 * @param code - the CSS source code
 */
export const lex = (code: string): Token[] => {
  const tokens: Token[] = []
  let currentCode = code
  let index = 0

  /**
   * Advance with the index.
   */
  const advance = (string: string): void => {
    index += string.length
    currentCode = currentCode.slice(string.length)
  }

  /**
   * Match a regular expression and advance with the index
   * @param regexp - the regular expression to match against
   */
  const match = (regexp: RegExp): RegExpExecArray | null => {
    const result = regexp.exec(currentCode)
    if (!result) {
      return null
    }
    const string = result[0]
    advance(string)
    return result
  }

  /**
   * Push a token into the token array.
   */
  const token = ({ type, value }: { type: TokenType; value: string }): void => {
    if (!value) {
      return
    }
    tokens.push({
      type,
      value,
      offset: index - value.length,
    })
  }

  /**
   * Match a selector, e.g. '.btn'
   */
  const selector = (): void => {
    const selectorRE = /^[^\\{\\}]+/
    const result = match(selectorRE)
    if (result) {
      token({
        type: 'selector',
        value: result[0].trim(),
      })
    }
  }

  /**
   * Match the opening brace, e.g. '{'
   */
  const open = (): void => {
    const openRE = /^\{/
    const result = match(openRE)
    if (result) {
      token({
        type: 'open',
        value: result[0],
      })
    }
  }

  /**
   * Match the closing brace, e.g. '}'
   */
  const close = (): void => {
    const closeRE = /^\}/
    const result = match(closeRE)
    if (result) {
      token({
        type: 'close',
        value: result[0],
      })
    }
  }

  /**
   * Match whitespace, e.g. ' '
   */
  const whitespace = (): void => {
    match(/^\s+/)
  }

  /**
   * Match everything between the opening and the closing brace
   */
  const between = (): void => {
    const betweenRE = /^[^\\}]+/
    const result = match(betweenRE)
    if (result) {
      token({
        type: 'between',
        value: result[0],
      })
    }
  }

  while (currentCode.length > 0) {
    whitespace()
    selector() // .btn
    open() // {
    between() // color: dodgerblue
    close() // }
    whitespace()
  }
  return tokens
}

type Selector = string | undefined

// Optimize: binary search
/**
 * Find the CSS selector at a given cursor offset inside the document.
 * @param tokens - an array of tokens
 * @param offset - the cursor offset inside the document
 */
const findSelectorAtOffsetWithTokens = (tokens: Token[], offset: number): Selector => {
  let currentSelector: Selector
  let previousToken: Token
  let currentToken: Token
  for (let i = 0; i < tokens.length; i++) {
    currentToken = tokens[i]
    previousToken = tokens[i - 1]
    if (previousToken && previousToken.type === 'close') {
      currentSelector = undefined
    }
    if (currentToken.type === 'selector') {
      currentSelector = currentToken.value
    }
    if (currentToken.offset === offset + 1) {
      return currentSelector
    }
    if (currentToken.offset > offset) {
      if (!previousToken || previousToken.type === 'close') {
        return undefined
      }
      return currentSelector
    }
  }
  return undefined
}

export const findCssSelectorAtOffset = (code: string, offset: number) => {
  const tokens = lex(code)
  return findSelectorAtOffsetWithTokens(tokens, offset)
}

// function testFindPositionForSelector(
//   code: string,
//   expectedSelector: string | undefined
// ): void {
//   const position = code.indexOf('|')
//   const tokens = lex(code.replace('|', ''))

//   findSelectorForPosition(tokens, position) // ?
// }

// testFindPositionForSelector(` |p{color:green}`, 'p')
// const code = ` .btn, .ben {
//   .blob:ok

// }

// .b{

//   color:green
// }
// `
// const tokens = lex(code) // ?
// const position = 30
// code.slice(position) // ?

// findSelectorForPosition(tokens, position) // ?
