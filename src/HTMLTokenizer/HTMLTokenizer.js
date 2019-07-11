/* eslint-disable no-negated-condition */
/* eslint-disable complexity */
/* Unittests: HTML Tokenizer */

let i = 0;
const TEXT = i++;
const BEFORE_TAG_NAME = i++; // After <
const IN_TAG_NAME = i++;
const BEFORE_CLOSING_TAG_NAME = i++;
const IN_CLOSING_TAG_NAME = i++;
const AFTER_CLOSING_TAG_NAME = i++;
const AFTER_SELFCLOSE_SLASH = i++;
// Attributes
const BEFORE_ATTRIBUTE_NAME = i++;
const AFTER_QUOTED_ATTRIBUTE_VALUE = i++;
const IN_ATTRIBUTE_NAME = i++;
const AFTER_ATTRIBUTE_NAME = i++;
const BEFORE_ATTRIBUTE_VALUE = i++;
const IN_ATTRIBUTE_VALUE_DOUBLE_QUOTES = i++; // "
const IN_ATTRIBUTE_VALUE_SINGLE_QUOTES = i++; // '
const IN_ATTRIBUTE_VALUE_NO_QUOTES = i++;
// Declarations
const BEFORE_DECLARATION = i++; // !
const IN_DECLARATION = i++;
// Processing instructions
const IN_PROCESSING_INSTRUCTION = i++; // ?
// comments
const BEFORE_COMMENT = i++;
const IN_COMMENT = i++;
const AFTER_COMMENT_1 = i++;
const AFTER_COMMENT_2 = i++;
// Cdata
const BEFORE_CDATA_1 = i++; // [
const BEFORE_CDATA_2 = i++; // C
const BEFORE_CDATA_3 = i++; // D
const BEFORE_CDATA_4 = i++; // A
const BEFORE_CDATA_5 = i++; // T
const BEFORE_CDATA_6 = i++; // A
const IN_CDATA = i++; // [
const AFTER_CDATA_1 = i++; // ]
const AFTER_CDATA_2 = i++; // ]
// special tags
const BEFORE_SPECIAL = i++; // S
const BEFORE_SPECIAL_END = i++; // S
const BEFORE_SCRIPT_1 = i++; // C
const BEFORE_SCRIPT_2 = i++; // R
const BEFORE_SCRIPT_3 = i++; // I
const BEFORE_SCRIPT_4 = i++; // P
const BEFORE_SCRIPT_5 = i++; // T
const AFTER_SCRIPT_1 = i++; // C
const AFTER_SCRIPT_2 = i++; // R
const AFTER_SCRIPT_3 = i++; // I
const AFTER_SCRIPT_4 = i++; // P
const AFTER_SCRIPT_5 = i++; // T
const BEFORE_STYLE_1 = i++; // T
const BEFORE_STYLE_2 = i++; // Y
const BEFORE_STYLE_3 = i++; // L
const BEFORE_STYLE_4 = i++; // E
const AFTER_STYLE_1 = i++; // T
const AFTER_STYLE_2 = i++; // Y
const AFTER_STYLE_3 = i++; // L
const AFTER_STYLE_4 = i++; // E

/** @typedef {{line: number, ch: number}} Position */

/**
 * @typedef {{type:string
	contents:string
	start:number,
	end: number,
	startPos: Position | undefined
	endPos: Position | undefined
}} Token
 */

/** @typedef {{ state : number,
								buffer : string,
								sectionStart : number,
								sectionStartPos : Position | undefined,
								index : number,
								indexPos : Position|undefined,
								special : number, // 1 for script, 2 for style
								token : Token | undefined,
								nextToken : Token | undefined
							}} Context */

/**
 * @private
 * @param {string} c the character to test
 * @return {boolean} true if c is whitespace
 */
function isWhitespace(c) {
	return c === ' ' || c === '\t' || c === '\r' || c === '\n';
}

/**
 * @param {string} char the character to test
 * @return {boolean} true if char is legal in an HTML tag name
 */
function isLegalInTagName(char) {
	// We allow "-" in tag names since they're popular in Angular custom tag names
	// and will be legal in the web components spec.
	return /[A-Za-z0-9-]/.test(char);
}

/**
 * @param {string} c the character to test
 * @return {boolean} true if c is legal in an HTML attribute name
 */
function isLegalInAttributeName(c) {
	return c !== '"' && c !== '\'' && c !== '<' && c !== '=';
}

/**
 * @param {string} c the character to test
 * @return {boolean} true if c is legal in an unquoted attribute value
 */
function isLegalInUnquotedAttributeValue(c) {
	return c !== '<' && c !== '=';
}

/**
 *
 * @param {Position|undefined} pos
 * @param {number|undefined} offset
 */
function clonePos(pos = undefined, offset = undefined) {
	return pos ? {line: pos.line, ch: pos.ch + (offset || 0)} : undefined;
}

/**
 * Returns the next token in the HTML document, or null if we're at the end of the document.
 * @return {{type: string, contents: string, start: number, end: number}|undefined} token The next token, with the following fields:
 *
 *
 *
 *    type: The type of token, one of:
 *          "error" - invalid syntax was found, tokenization aborted. Calling nextToken() again will produce undefined results.
 *          "text" - contents contains the text
 *          "opentagname" - an open tag was started; contents contains the tag name
 *          "attribname" - an attribute was encountered; contents contains the attribute name
 *          "attribvalue" - the value for the previous attribname was encountered; contents contains the (unquoted) value
 *              (Note that attributes like checked and disabled might not have values.)
 *          "opentagend" - the end of an open tag was encountered; contents is unspecified
 *          "selfclosingtag" - a "/>" was encountered indicating that a void element was self-closed; contents is unspecified
 *              (Note that this is optional in HTML; void elements like <img> will end with "opentagend", not "selfclosingtag")
 *          "closetag" - a close tag was encountered; contents contains the tag name
 *          "comment" - a comment was encountered; contents contains the body of the comment
 *          "cdata" - a CDATA block was encountered; contents contains the text inside the block
 *    contents: the contents of the token, as specified above. Note that "opentagend" and "selfclosingtag" really specify positions,
 *          not tokens, and so have no contents.
 *    start: the start index of the token contents within the text, or -1 for "opentagend" and "selfclosingtag"
 *    end: the end index of the token contents within the text, or the position of the boundary for "opentagend" and "selfclosingtag"
 */

/**
 *
 * @param {Context} context
 */
function nextToken(context) {
	context.token = undefined;

	if (context.nextToken) {
		const result = context.nextToken;
		context.nextToken = undefined;
		return result;
	}

	while (context.index < context.buffer.length && !context.token) {
		const c = context.buffer.charAt(context.index);
		if (context.state === TEXT) {
			if (c === '<') {
				emitTokenIfNonempty(context, 'text');
				context.state = BEFORE_TAG_NAME;
				startSection(context);
			}
		} else if (context.state === BEFORE_TAG_NAME) {
			if (c === '/') {
				context.state = BEFORE_CLOSING_TAG_NAME;
			} else if (c === '>' || context.special > 0) {
				context.state = TEXT;
			} else if (c === '!') {
				context.state = BEFORE_DECLARATION;
				startSection(context, 1);
			} else if (c === '?') {
				context.state = IN_PROCESSING_INSTRUCTION;
				startSection(context, 1);
			} else if (c === 's' || c === 'S') {
				context.state = BEFORE_SPECIAL;
				startSection(context);
			} else if (!isLegalInTagName(c)) {
				emitSpecialToken(context, 'error');
				break;
			} else if (!isWhitespace(c)) {
				context.state = IN_TAG_NAME;
				startSection(context);
			}
		} else if (context.state === IN_TAG_NAME) {
			if (c === '/') {
				emitToken(context, 'opentagname');
				emitSpecialToken(
					context,
					'selfclosingtag',
					context.index + 2,
					clonePos(context.indexPos, 2)
				);
				context.state = AFTER_SELFCLOSE_SLASH;
			} else if (c === '>') {
				emitToken(context, 'opentagname');
				emitSpecialToken(
					context,
					'opentagend',
					context.index + 1,
					clonePos(context.indexPos, 1)
				);
				context.state = TEXT;
				startSection(context, 1);
			} else if (isWhitespace(c)) {
				emitToken(context, 'opentagname');
				context.state = BEFORE_ATTRIBUTE_NAME;
			} else if (!isLegalInTagName(c)) {
				emitSpecialToken(context, 'error');
				break;
			}
		} else if (context.state === BEFORE_CLOSING_TAG_NAME) {
			if (c === '>') {
				context.state = TEXT;
			} else if (context.special > 0) {
				if (c === 's' || c === 'S') {
					context.state = BEFORE_SPECIAL_END;
				} else {
					context.state = TEXT;
					continue;
				}
			} else if (!isLegalInTagName(c)) {
				emitSpecialToken(context, 'error');
				break;
			} else if (!isWhitespace(c)) {
				context.state = IN_CLOSING_TAG_NAME;
				startSection(context);
			}
		} else if (context.state === IN_CLOSING_TAG_NAME) {
			if (c === '>') {
				emitToken(context, 'closetag');
				context.state = TEXT;
				startSection(context, 1);
				context.special = 0;
			} else if (isWhitespace(c)) {
				emitToken(context, 'closetag');
				context.state = AFTER_CLOSING_TAG_NAME;
				context.special = 0;
			} else if (!isLegalInTagName(c)) {
				emitSpecialToken(context, 'error');
				break;
			}
		} else if (context.state === AFTER_CLOSING_TAG_NAME) {
			if (c === '>') {
				context.state = TEXT;
				startSection(context, 1);
			} else if (!isWhitespace(c)) {
				// There must be only whitespace in the closing tag after the name until the ">".
				emitSpecialToken(context, 'error');
				break;
			}
		} else if (context.state === AFTER_SELFCLOSE_SLASH) {
			// Nothing (even whitespace) can come between the / and > of a self-close.
			if (c === '>') {
				context.state = TEXT;
				startSection(context, 1);
			} else {
				emitSpecialToken(context, 'error');
				break;
			}

			/*
			 *	Attributes
			 */
		} else if (context.state === BEFORE_ATTRIBUTE_NAME) {
			if (c === '>') {
				context.state = TEXT;
				emitSpecialToken(
					context,
					'opentagend',
					context.index + 1,
					clonePos(context.indexPos, 1)
				);
				startSection(context, 1);
			} else if (c === '/') {
				emitSpecialToken(
					context,
					'selfclosingtag',
					context.index + 2,
					clonePos(context.indexPos, 2)
				);
				context.state = AFTER_SELFCLOSE_SLASH;
			} else if (!isLegalInAttributeName(c)) {
				emitSpecialToken(context, 'error');
				break;
			} else if (!isWhitespace(c)) {
				context.state = IN_ATTRIBUTE_NAME;
				startSection(context);
			}
		} else if (context.state === IN_ATTRIBUTE_NAME) {
			if (c === '=') {
				emitTokenIfNonempty(context, 'attribname');
				context.state = BEFORE_ATTRIBUTE_VALUE;
			} else if (isWhitespace(c)) {
				emitTokenIfNonempty(context, 'attribname');
				context.state = AFTER_ATTRIBUTE_NAME;
			} else if (c === '/' || c === '>') {
				emitTokenIfNonempty(context, 'attribname');
				context.state = BEFORE_ATTRIBUTE_NAME;
				continue;
			} else if (!isLegalInAttributeName(c)) {
				emitSpecialToken(context, 'error');
				break;
			}
		} else if (context.state === AFTER_ATTRIBUTE_NAME) {
			if (c === '=') {
				context.state = BEFORE_ATTRIBUTE_VALUE;
			} else if (c === '/' || c === '>') {
				context.state = BEFORE_ATTRIBUTE_NAME;
				continue;
			} else if (!isLegalInAttributeName(c)) {
				emitSpecialToken(context, 'error');
				break;
			} else if (!isWhitespace(c)) {
				context.state = IN_ATTRIBUTE_NAME;
				startSection(context);
			}
		} else if (context.state === BEFORE_ATTRIBUTE_VALUE) {
			if (c === '"') {
				context.state = IN_ATTRIBUTE_VALUE_DOUBLE_QUOTES;
				startSection(context, 1);
			} else if (c === '\'') {
				context.state = IN_ATTRIBUTE_VALUE_SINGLE_QUOTES;
				startSection(context, 1);
			} else if (!isLegalInUnquotedAttributeValue(c)) {
				emitSpecialToken(context, 'error');
				break;
			} else if (!isWhitespace(c)) {
				context.state = IN_ATTRIBUTE_VALUE_NO_QUOTES;
				startSection(context);
			}
		} else if (context.state === IN_ATTRIBUTE_VALUE_DOUBLE_QUOTES) {
			if (c === '"') {
				emitToken(context, 'attribvalue');
				context.state = AFTER_QUOTED_ATTRIBUTE_VALUE;
			}
		} else if (context.state === IN_ATTRIBUTE_VALUE_SINGLE_QUOTES) {
			if (c === '\'') {
				context.state = AFTER_QUOTED_ATTRIBUTE_VALUE;
				emitToken(context, 'attribvalue');
			}
		} else if (context.state === IN_ATTRIBUTE_VALUE_NO_QUOTES) {
			if (c === '>') {
				emitToken(context, 'attribvalue');
				emitSpecialToken(
					context,
					'opentagend',
					context.index + 1,
					clonePos(context.indexPos, 1)
				);
				context.state = TEXT;
				startSection(context, 1);
			} else if (isWhitespace(c)) {
				emitToken(context, 'attribvalue');
				context.state = BEFORE_ATTRIBUTE_NAME;
			} else if (!isLegalInUnquotedAttributeValue(c)) {
				emitSpecialToken(context, 'error');
				break;
			}
		} else if (context.state === AFTER_QUOTED_ATTRIBUTE_VALUE) {
			// There must be at least one whitespace between the end of a quoted
			// attribute value and the next attribute, if any.
			if (c === '>') {
				context.state = TEXT;
				emitSpecialToken(
					context,
					'opentagend',
					context.index + 1,
					clonePos(context.indexPos, 1)
				);
				startSection(context, 1);
			} else if (c === '/') {
				emitSpecialToken(
					context,
					'selfclosingtag',
					context.index + 2,
					clonePos(context.indexPos, 2)
				);
				context.state = AFTER_SELFCLOSE_SLASH;
			} else if (isWhitespace(c)) {
				context.state = BEFORE_ATTRIBUTE_NAME;
			} else {
				emitSpecialToken(context, 'error');
				break;
			}

			/*
			 *	Declarations
			 */
		} else if (context.state === BEFORE_DECLARATION) {
			if (c === '[') {
				context.state = BEFORE_CDATA_1;
			} else if (c === '-') {
				context.state = BEFORE_COMMENT;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === IN_DECLARATION) {
			if (c === '>') {
				emitToken(context, 'declaration');
				context.state = TEXT;
				startSection(context, 1);
			}

			/*
			 *	Processing instructions
			 */
		} else if (context.state === IN_PROCESSING_INSTRUCTION) {
			if (c === '>') {
				emitToken(context, 'processinginstruction');
				context.state = TEXT;
				startSection(context, 1);
			}

			/*
			 *	Comments
			 */
		} else if (context.state === BEFORE_COMMENT) {
			if (c === '-') {
				context.state = IN_COMMENT;
				startSection(context, 1);
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === IN_COMMENT) {
			if (c === '-') {
				context.state = AFTER_COMMENT_1;
			}
		} else if (context.state === AFTER_COMMENT_1) {
			if (c === '-') {
				context.state = AFTER_COMMENT_2;
			} else {
				context.state = IN_COMMENT;
			}
		} else if (context.state === AFTER_COMMENT_2) {
			if (c === '>') {
				// Remove 2 trailing chars
				// It should be okay to just decrement the char position by 2 because we know neither of the previous
				// characters is a newline.
				emitToken(
					context,
					'comment',
					context.index - 2,
					clonePos(context.indexPos, -2)
				);
				context.state = TEXT;
				startSection(context, 1);
			} else if (c !== '-') {
				context.state = IN_COMMENT;
			}
			// Else: stay in AFTER_COMMENT_2 (`--->`)

			/*
			 *	cdata
			 */
		} else if (context.state === BEFORE_CDATA_1) {
			if (c === 'C') {
				context.state = BEFORE_CDATA_2;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === BEFORE_CDATA_2) {
			if (c === 'D') {
				context.state = BEFORE_CDATA_3;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === BEFORE_CDATA_3) {
			if (c === 'A') {
				context.state = BEFORE_CDATA_4;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === BEFORE_CDATA_4) {
			if (c === 'T') {
				context.state = BEFORE_CDATA_5;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === BEFORE_CDATA_5) {
			if (c === 'A') {
				context.state = BEFORE_CDATA_6;
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === BEFORE_CDATA_6) {
			if (c === '[') {
				context.state = IN_CDATA;
				startSection(context, 1);
			} else {
				context.state = IN_DECLARATION;
			}
		} else if (context.state === IN_CDATA) {
			if (c === ']') {
				context.state = AFTER_CDATA_1;
			}
		} else if (context.state === AFTER_CDATA_1) {
			if (c === ']') {
				context.state = AFTER_CDATA_2;
			} else {
				context.state = IN_CDATA;
			}
		} else if (context.state === AFTER_CDATA_2) {
			if (c === '>') {
				// Remove 2 trailing chars
				// It should be okay to just decrement the char position by 2 because we know neither of the previous
				// characters is a newline.
				emitToken(
					context,
					'cdata',
					context.index - 2,
					clonePos(context.indexPos, -2)
				);
				context.state = TEXT;
				startSection(context, 1);
			} else if (c !== ']') {
				context.state = IN_CDATA;
			}
			// Else: stay in AFTER_CDATA_2 (`]]]>`)

			/*
			 * special tags
			 */
		} else if (context.state === BEFORE_SPECIAL) {
			if (c === 'c' || c === 'C') {
				context.state = BEFORE_SCRIPT_1;
			} else if (c === 't' || c === 'T') {
				context.state = BEFORE_STYLE_1;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_SPECIAL_END) {
			if (context.special === 1 && (c === 'c' || c === 'C')) {
				context.state = AFTER_SCRIPT_1;
			} else if (context.special === 2 && (c === 't' || c === 'T')) {
				context.state = AFTER_STYLE_1;
			} else {
				context.state = TEXT;
			}

			/*
			 * Script
			 */
		} else if (context.state === BEFORE_SCRIPT_1) {
			if (c === 'r' || c === 'R') {
				context.state = BEFORE_SCRIPT_2;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_SCRIPT_2) {
			if (c === 'i' || c === 'I') {
				context.state = BEFORE_SCRIPT_3;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_SCRIPT_3) {
			if (c === 'p' || c === 'P') {
				context.state = BEFORE_SCRIPT_4;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_SCRIPT_4) {
			if (c === 't' || c === 'T') {
				context.state = BEFORE_SCRIPT_5;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_SCRIPT_5) {
			if (c === '/' || c === '>' || isWhitespace(c)) {
				context.special = 1;
			}

			context.state = IN_TAG_NAME;
			continue; // Consume the token again
		} else if (context.state === AFTER_SCRIPT_1) {
			if (c === 'r' || c === 'R') {
				context.state = AFTER_SCRIPT_2;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_SCRIPT_2) {
			if (c === 'i' || c === 'I') {
				context.state = AFTER_SCRIPT_3;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_SCRIPT_3) {
			if (c === 'p' || c === 'P') {
				context.state = AFTER_SCRIPT_4;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_SCRIPT_4) {
			if (c === 't' || c === 'T') {
				context.state = AFTER_SCRIPT_5;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_SCRIPT_5) {
			if (c === '>' || isWhitespace(c)) {
				context.state = IN_CLOSING_TAG_NAME;
				startSection(context, -6);
				continue; // Reconsume the token
			} else {
				context.state = TEXT;
			}

			/*
			 * Style
			 */
		} else if (context.state === BEFORE_STYLE_1) {
			if (c === 'y' || c === 'Y') {
				context.state = BEFORE_STYLE_2;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_STYLE_2) {
			if (c === 'l' || c === 'L') {
				context.state = BEFORE_STYLE_3;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_STYLE_3) {
			if (c === 'e' || c === 'E') {
				context.state = BEFORE_STYLE_4;
			} else {
				context.state = IN_TAG_NAME;
				continue; // Consume the token again
			}
		} else if (context.state === BEFORE_STYLE_4) {
			if (c === '/' || c === '>' || isWhitespace(c)) {
				context.special = 2;
			}

			context.state = IN_TAG_NAME;
			continue; // Consume the token again
		} else if (context.state === AFTER_STYLE_1) {
			if (c === 'y' || c === 'Y') {
				context.state = AFTER_STYLE_2;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_STYLE_2) {
			if (c === 'l' || c === 'L') {
				context.state = AFTER_STYLE_3;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_STYLE_3) {
			if (c === 'e' || c === 'E') {
				context.state = AFTER_STYLE_4;
			} else {
				context.state = TEXT;
			}
		} else if (context.state === AFTER_STYLE_4) {
			if (c === '>' || isWhitespace(c)) {
				context.state = IN_CLOSING_TAG_NAME;
				startSection(context, -5);
				continue; // Reconsume the token
			} else {
				context.state = TEXT;
			}
		} else {
			console.error('HTMLTokenizer: Encountered unknown state');
			emitSpecialToken(context, 'error');
			break;
		}

		if (c === '\n') {
			// @ts-ignore
			context.indexPos.line++;
			// @ts-ignore
			context.indexPos.ch = 0;
		} else {
			// @ts-ignore
			context.indexPos.ch++;
		}

		context.index++;
	}

	if (!context.token) {
		if (context.state !== TEXT) {
			// We hit EOF in the middle of processing something else.
			emitSpecialToken(context, 'error');
		} else {
			emitTokenIfNonempty(context, 'text');
			startSection(context);
		}
	}

	return context.token;
}

/**
 *
 * @param {Context} context
 * @param {number} offset
 */
function startSection(context, offset = 0) {
	offset = offset || 0;
	context.sectionStart = context.index + offset;
	// Normally it wouldn't be safe to assume that we can just add the offset to the
	// character position, because there might be a newline, which would require us to
	// move to the next line. However, in all the cases where this is called, we are
	// adjusting for characters that we know are not newlines.
	context.sectionStartPos = clonePos(context.indexPos, offset);
}

/**
 * @private
 * Extract the portion of the buffer since _sectionStart and set it to be the next token we return
 * from `nextToken()`. If there's already a _token, we stuff it in _nextToken instead.
 * @param {Context} context
 * @param {string} type The token's type (see documentation for `nextToken()`)
 * @param {number|undefined} index If specified, the index to use as the end of the token; uses this._index if not specified
 * @param {Position|undefined} indexPos If specified, the index to use as the end of the token; uses this._index if not specified
 */
function setToken(
	context,
	type,
	index = context.index,
	indexPos = context.indexPos
) {
	const token = {
		type,
		contents:
			context.sectionStart === -1 ?
				'' :
				context.buffer.substring(context.sectionStart, index),
		start: context.sectionStart,
		end: index,
		startPos: clonePos(context.sectionStartPos),
		endPos: clonePos(indexPos)
	};
	if (context.token) {
		// Queue context token to be emitted next. In theory it would be more general to have
		// an arbitrary-length queue, but currently we only ever emit at most two tokens in a
		// single pass through the tokenization loop.
		if (context.nextToken) {
			console.error(
				'HTMLTokenizer: Tried to emit more than two tokens in a single call'
			);
		}

		context.nextToken = token;
	} else {
		context.token = token;
	}
}

/**
 * @private
 * Sets the token to be returned from `nextToken()` and resets the section start to an invalid value.
 * this._sectionStart should be set to a valid value before the next call to one of the `_emit` methods.
 * @param {Context} context
 * @param {string} type The token's type (see documentation for `nextToken()`)
 * @param {number|undefined} index If specified, the index to use as the end of the token; uses this._index if not specified
 * @param {Position|undefined} indexPos If specified, the index to use as the end of the token; uses this._index if not specified
 */
function emitToken(context, type, index = undefined, indexPos = undefined) {
	setToken(context, type, index, indexPos);
	context.sectionStart = -1;
	context.sectionStartPos = undefined;
}

/**
 * @private
 * Like `_emitToken()`, but used for special tokens that don't have real content (like opentagend and selfclosingtag).
 * @param {Context} context
 * @param {string} type The token's type (see documentation for `nextToken()`)
 * @param {number|undefined} index If specified, the index to use as the end of the token; uses this._index if not specified
 * @param {Position|undefined} indexPos If specified, the index to use as the end of the token; uses this._index if not specified
 */
function emitSpecialToken(
	context,
	type,
	index = undefined,
	indexPos = undefined
) {
	// Force the section start to be -1, since these tokens don't have meaningful content--they're
	// just marking particular boundaries we care about (end of an open tag or a self-closing tag).
	context.sectionStart = -1;
	context.sectionStartPos = undefined;
	emitToken(context, type, index, indexPos);
}

/**
 * @private
 * Like `_emitToken()`, but only emits a token if there is actually content in it. Note that this still
 * resets this._sectionStart to an invalid value even if there is no content, so a new section must be
 * started before the next `_emit`.
 * @param {Context} context
 * @param {string} type The token's type (see documentation for `nextToken()`)
 */
function emitTokenIfNonempty(context, type) {
	if (context.index > context.sectionStart) {
		setToken(context, type);
	}

	context.sectionStart = -1;
	context.sectionStartPos = undefined;
}

/**
 * A simple HTML tokenizer. See the description of nextToken() for usage details.
 * @param {string} text The HTML document to tokenize.
 */
function createTokenizer(text) {
	/**
	 * @type {Context}
	 */
	const context = {
		state: TEXT,
		buffer: text,
		sectionStart: 0,
		sectionStartPos: {line: 0, ch: 0},
		index: 0,
		indexPos: {line: 0, ch: 0},
		special: 0, // 1 for script, 2 for style
		token: undefined,
		nextToken: undefined
	};

	return {
		nextToken() {
			return nextToken(context);
		}
	};
}

exports.createTokenizer = createTokenizer;
