/* eslint-disable no-case-declarations */
/* eslint-disable complexity */

import { createMultiLineStream } from './createMultiLineStream'

// Const elementsWithEmbeddedContentMap = {
//   style: true,
//   script: true,
// }
// TODO
// function isElementWithEmbeddedContent(tagName: string): boolean {
//   return elementsWithEmbeddedContentMap[tagName]
// }

/**
 * @type {{[ket:string]:boolean}}
 */
const quoteMap = {
  "'": true,
  '"': true,
}

/**
 *
 * @param {string} char
 * @return {boolean}
 */
function isQuote(char) {
  return quoteMap[char]
}

/**
 * HTML tag name (explaining the regex)
 *
 * This regex is for the name of the html tag
 * E.g. we want to match "div" inside "<div>"
 *
 * ^  ### start
 * [:\w]  ### ":" or character or digit
 * [:\w-.]  ### ":" or character or digit or "-" or "."
 */
const htmlTagNameRE = /^[!:\w][:\w-.]*/

/**
 * Html attribute name (explaining the regex)
 *
 * This regex is for html attribute names,
 * E.g. we want to match "class" in "<div class="center">"
 *
 * ^  ### start
 *   [^\s"'>/=]*  ### any anything that isn't whitespace, ", ', >, / or =
 */
const htmlAttributeNameRE = /^[^\s"'>/=]*/

/**
 * Html attribute value (explaining the regex)
 *
 * ^  ### start
 *   [^\s"'`=<>/]+  ### no whitespace, quotes, "=", "<", ">" and "/"
 */
const htmlAttributeValueRE = /^[^\s"'`=<>/]+/

/**
 *
 * @param{string}input
 * @param {{initialOffset?:number,initialState?:import('./types').ScannerState,embeddedContentTags?:string[]}} param0
 */
export function createScanner(
  input,
  {
    initialOffset = 0,
    initialState = 'within-content',
    embeddedContentTags = ['script', 'style'],
  } = {}
) {
  const stream = createMultiLineStream(input, initialOffset)
  let error: { type: 'invalid' | 'soft-invalid'; message: string; offset: number } | null = null
  let count = 0 // for preventing endless loops TODO: remove once stable
  /**
   * @type {import('./types').ScannerState}
   */
  let state = initialState
  /**
   * @type{number}
   */
  let tokenOffset
  /**
   * Whether or not a space is after the starting tag name.
   * E.g. "<div >" but not "<div''>" and "<div class="center" >" but not "<div class="center">""
   * This is used to determine whether the following characters are attributes or just invalid
   * @type{boolean}
   */
  let hasSpaceAfterStartingTagName
  /**
   * @type{boolean}
   */
  let embeddedContent

  /**
   * @return{string|undefined}
   */
  function nextElementName() {
    const result = stream.advanceIfRegExp(htmlTagNameRE)
    return result
  }

  /**
   * @return{string|undefined}
   */
  function nextAttributeName() {
    return stream.advanceIfRegExp(htmlAttributeNameRE)
  }

  /**
   * @return{string|undefined}
   */
  function nextUnquotedAttributeValue() {
    return stream.advanceIfRegExp(htmlAttributeValueRE)
  }

  /**
   * @type{string|undefined}
   */
  let lastTagName
  // eslint-disable-next-line consistent-return
  // eslint-disable-next-line valid-jsdoc
  /**
   * @return {any}
   */
  function scan() {
    if (count++ > 1000) {
      throw new Error('endless loop detected')
    }

    tokenOffset = stream.position
    /**
     * @type{string|undefined}
     */
    let lastAttributeName
    if (stream.eos()) {
      return 'eos'
    }

    switch (state) {
      case 'within-comment':
        if (stream.advanceIfChars('-->')) {
          state = 'within-content'
          return 'end-comment-tag'
        }

        stream.advanceUntilChars('-->')
        return 'comment'
      case 'within-content':
        if (stream.advanceIfChars('</')) {
          state = 'after-opening-end-tag'
          return 'end-tag-open'
        }

        if (embeddedContent) {
          stream.advanceUntilChars(`</${lastTagName}`)
          return 'content'
        }

        if (stream.advanceIfChars('<!--')) {
          state = 'within-comment'
          return 'start-comment-tag'
        }

        // console.log(stream.peekRight(), stream.peekRight(1));
        if (stream.peekRight() === '<') {
          stream.advance(1)
          if (/[a-zA-Z]/.test(stream.peekRight())) {
            state = 'after-opening-start-tag'
            return 'start-tag-open'
          }

          if (stream.nextChars(8).toLowerCase() === '!doctype') {
            state = 'after-opening-start-tag'
            return 'start-tag-open'
          }

          error = {
            type: 'invalid',
            message: 'expected start or end tag',
            offset: tokenOffset,
          }
          stream.goToEnd()
          return 'error'
        }

        stream.advanceUntilChar('<')
        return 'content'
      case 'after-opening-end-tag':
        const tagName = nextElementName()

        if (tagName) {
          state = 'within-end-tag'
          return 'end-tag'
        }

        error = {
          type: 'invalid',
          message: 'invalid end tag',
          offset: tokenOffset,
        }
        return 'error'
        // if (stream.peekRight(0) === '>') {
        // 	console.log('self close');
        // 	state = 'within-end-tag';
        // 	return 'end-tag';
        // }

        // TODO error
        console.error('error 1111')
        break
      case 'within-end-tag':
        if (stream.skipWhitespace()) {
          tokenOffset = stream.position
        }

        if (stream.advanceIfChar('>')) {
          state = 'within-content'
          embeddedContent = false
          return 'end-tag-close'
        }

        error = {
          type: 'invalid',
          message: 'invalid end tag',
          offset: tokenOffset,
        }
        return 'error'

        break
      case 'after-opening-start-tag':
        lastTagName = nextElementName()
        if (lastTagName) {
          if (embeddedContentTags.includes(lastTagName)) {
            embeddedContent = true
          }

          state = 'within-start-tag'
          return 'start-tag'
        }

        // This is a tag like "<>"
        if (stream.peekRight() === '>') {
          state = 'within-start-tag'
          return 'start-tag'
        }

        // At this point there is no tag name sign after the opening tag "<"
        // E.g. "< div"
        // So we just assume that it is text
        state = 'within-content'
        return scan()
      case 'within-start-tag':
        if (stream.skipWhitespace()) {
          tokenOffset = stream.position
          hasSpaceAfterStartingTagName = true
        }

        if (hasSpaceAfterStartingTagName) {
          lastAttributeName = nextAttributeName()
          if (lastAttributeName) {
            state = 'after-attribute-name'
            hasSpaceAfterStartingTagName = false
            return 'attribute-name'
          }
        }

        if (stream.advanceIfChars('/>')) {
          state = 'within-content'
          return 'start-tag-self-close'
        }

        if (stream.advanceIfChars('>')) {
          state = 'within-content'
          return 'start-tag-close'
        }

        // At this point there is space and no closing tag
        // E.g. "<div;"
        stream.advance(1)
        error = {
          type: 'invalid',
          message: 'unexpected token',
          offset: tokenOffset,
        }
        return 'error'
      case 'after-attribute-name':
        if (stream.skipWhitespace()) {
          tokenOffset = stream.position
          hasSpaceAfterStartingTagName = true
        }

        if (stream.advanceIfChar('=')) {
          state = 'before-attribute-value'
          return 'delimiter-assign'
        }

        // At this point there is no equal sign after an attribute
        // E.g. "<div class>"
        // So we just assume that we are still inside the tag
        state = 'within-start-tag'
        return scan()
      case 'before-attribute-value':
        if (stream.skipWhitespace()) {
          tokenOffset = stream.position
        }

        // No quotes around attribute e.g. "<div class=center>"
        const unquotedAttributeValue = nextUnquotedAttributeValue()
        if (unquotedAttributeValue) {
          state = 'within-start-tag'
          return 'attribute-value'
        }

        // Single quote or double quote around attribute value, e.g. "<div class="center">"
        const char = stream.peekRight()
        if (isQuote(char)) {
          stream.advance(1) // Consume opening quote
          if (stream.advanceUntilChar(char)) {
            stream.advance(1) // Consume closing quote
            state = 'within-start-tag'
            return 'attribute-value'
          }

          error = {
            type: 'invalid',
            message: 'missing closing quote in attribute value',
            offset: tokenOffset,
          }
          return 'error'
        }

        error = {
          type: 'invalid',
          message: 'missing closing quote in attribute value',
          offset: tokenOffset,
        }
        return 'error'

      default:
        break
    }
  }

  return {
    scan,
    stream,
    getError() {
      return error
    },
    getTokenOffset() {
      return tokenOffset
    },
    getTokenText() {
      return stream.getSource().slice(tokenOffset, stream.position)
    },
    getTokenEnd() {
      return stream.position
    },
    get state() {
      return state
    },
    set state(newState) {
      state = newState
    },
  }
}

// const scanner = createScanner('<p class=>some text</p>');

// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
// scanner.scan(); // ?
// scanner.getTokenText(); // ?
