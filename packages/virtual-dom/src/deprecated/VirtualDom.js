// // @ts-nocheck
// /// <reference path="../types.ts" />

// const {createTokenizer} = require('../HTMLTokenizer/HTMLTokenizer');
// const {
// 	updateSignature: update,
// 	updateAttributeSignature
// } = require('../HTMLSimpleDom/HTMLSimpleDOM');

// /** @typedef {import('./HTMLSimpleDomBuilder.types').Context} Context */
// /** @typedef {import('../types').Position} Position */
// /** @typedef {import('./HTMLSimpleDomBuilder.types').Error} Error */
// /** @typedef {import('../HTMLSimpleDomBuilder/HTMLSimpleDom.types').SimpleNode} SimpleNode */

// /* eslint-disable max-depth */
// /* eslint-disable no-multi-assign */
// /* eslint-disable complexity */
// /* eslint-disable  */

// /**
//  * A list of tags that are self-closing (do not contain other elements).
//  * Mostly taken from http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
//  */
// /**
//  * @type {object}
//  */
// const voidElements = {
// 	area: true,
// 	base: true,
// 	basefont: true,
// 	br: true,
// 	col: true,
// 	command: true,
// 	embed: true,
// 	frame: true,
// 	hr: true,
// 	img: true,
// 	input: true,
// 	isindex: true,
// 	keygen: true,
// 	link: true,
// 	menuitem: true,
// 	meta: true,
// 	param: true,
// 	source: true,
// 	track: true,
// 	wbr: true,
// }

// let tagId = 1

// /**
//  *  Adds two {line, ch}-style positions, returning a new pos.
//  * @param {Position} pos1
//  * @param {Position} pos2
//  */
// function addPos(pos1, pos2) {
// 	return {
// 		line: pos1.line + pos2.line,
// 		ch: pos2.line === 0 ? pos1.ch + pos2.ch : pos2.ch,
// 	}
// }

// /**
//  *
//  * Offsets the character offset of the given {line, ch} pos by the given amount and returns a new pos.
//  *
//  * @param {Position} pos
//  * @param {number} offset
//  */
// function offsetPos(pos, offset) {
// 	return {line: pos.line, ch: pos.ch + offset}
// }

// /**
//  *
//  * A Builder creates a SimpleDOM tree of SimpleNode objects representing the
//  * "important" contents of an HTML document. It does not include things like comments.
//  * The nodes include information about their position in the text provided.
//  *

// /**
//  *
//  * @param {Context} context
//  * @param {any} token
//  */
// function logError(context, token) {
// 	/**
// 	 * @type {Error}
// 	 */
// 	const error = {token}
// 	const startPos = token
// 		? token.startPos || token.endPos
// 		: context.startOffsetPos
// 	const endPos = token ? token.endPos : context.startOffsetPos

// 	error.startPos = addPos(context.startOffsetPos, startPos)
// 	error.endPos = addPos(context.startOffsetPos, endPos)

// 	if (!context.errors) {
// 		context.errors = []
// 	}

// 	context.errors.push(error)
// }

// /**
//  * @private
//  *
//  * Generates a synthetic ID for text nodes. These IDs are only used
//  * for convenience when reading a SimpleDOM that is dumped to the console.
//  *
//  * @param {Object} textNode new node for which we are generating an ID
//  * @return {string} ID for the node
//  */
// function getTextNodeID(textNode) {
// 	const childIndex = textNode.parent.children.indexOf(textNode)
// 	if (childIndex === 0) {
// 		return textNode.parent.tagId + '.0'
// 	}
// 	return textNode.parent.children[childIndex - 1].tagId + 't'
// }

// /**
//  * Builds the SimpleDOM.
//  *
//  * @param {string} text
//  * @param {{startOffset?:number, startOffsetPos?:Position, strict?:boolean}} strict if errors are detected, halt and return null
//  * @return {SimpleNode|undefined} root of tree or null if parsing failed
//  */
// export function build(text, {startOffset, startOffsetPos, strict = true} = {}) {
// 	const tokenizer = createTokenizer(text)
// 	/**
// 	 * @type {SimpleNode[]}
// 	 */
// 	const stack = []
// 	/**
// 	 * @type {Context}
// 	 */
// 	const context = {
// 		text,
// 		currentTag: undefined,
// 		startOffset: startOffset || 0,
// 		startOffsetPos: startOffsetPos || {line: 0, ch: 0},
// 	}
// 	/**
// 	 */
// 	let token
// 	/**
// 	 * @type {SimpleNode}
// 	 */
// 	let lastClosedTag
// 	let lastTextNode
// 	let attributeName = null
// 	let tagId = 1
// 	/**
// 	 * @type {{[key:string]:any}}
// 	 */
// 	const nodeMap = {}

// 	/**
// 	 *
// 	 * @param {number} endIndex
// 	 * @param {Position} endPos
// 	 */
// 	function closeTag(endIndex, endPos) {
// 		lastClosedTag = stack[stack.length - 1]
// 		stack.pop()
// 		update(lastClosedTag)
// 		lastClosedTag.end = context.startOffset + endIndex
// 		lastClosedTag.endPos = addPos(context.startOffsetPos, endPos)
// 	}

// 	while ((token = tokenizer.nextToken()) !== undefined) {
// 		// LastTextNode is used to glue text nodes together
// 		// If the last node we saw was text but this one is not, then we're done gluing.
// 		// If this node is a comment, we might still encounter more text.
// 		if (token.type !== 'text' && token.type !== 'comment' && lastTextNode) {
// 			lastTextNode = null
// 		}

// 		if (token.type === 'error') {
// 			// PerfUtils.finalizeMeasurement(timerBuildFull); // Discard
// 			// PerfUtils.addMeasurement(timerBuildPart); // Use
// 			logError(context, token)
// 			return {
// 				dom: undefined,
// 				errors: context.errors,
// 			}
// 		}

// 		if (token.type === 'opentagname') {
// 			const newTagName = token.contents.toLowerCase()
// 			if (openImpliesClose.hasOwnProperty(newTagName)) {
// 				const closable = openImpliesClose[newTagName]
// 				while (
// 					stack.length > 0 &&
// 					closable.hasOwnProperty(stack[stack.length - 1].tag)
// 				) {
// 					// Close the previous tag at the start of this tag.
// 					// Adjust backwards for the < before the tag name.
// 					closeTag(token.start - 1, offsetPos(token.startPos, -1))
// 				}
// 			}

// 			/**
// 			 * @type {SimpleNode}
// 			 */
// 			const newTag = {
// 				tag: token.contents.toLowerCase(),
// 				children: [],
// 				attributes: {},
// 				parent: stack.length ? stack[stack.length - 1] : undefined,
// 				start: context.startOffset + token.start - 1,
// 				startPos: addPos(context.startOffsetPos, offsetPos(token.startPos, -1)), // Ok because we know the previous char was a "<"
// 			}
// 			newTag.tagId = tagId++

// 			// During undo in particular, it's possible that tag IDs may be reused and
// 			// the marks in the document may be misleading. If a tag ID has been reused,
// 			// we apply a new tag ID to ensure that our edits come out correctly.
// 			if (nodeMap[newTag.tagId]) {
// 				newTag.tagId = tagId++
// 			}

// 			nodeMap[newTag.tagId] = newTag
// 			if (newTag.parent) {
// 				newTag.parent.children.push(newTag)
// 			}

// 			context.currentTag = newTag

// 			if (voidElements.hasOwnProperty(newTag.tag)) {
// 				// This is a self-closing element.
// 				update(newTag)
// 			} else {
// 				stack.push(newTag)
// 			}
// 		} else if (token.type === 'opentagend' || token.type === 'selfclosingtag') {
// 			// TODO: disallow <p/>?
// 			if (context.currentTag) {
// 				if (
// 					token.type === 'selfclosingtag' &&
// 					stack.length &&
// 					stack[stack.length - 1] === context.currentTag
// 				) {
// 					// This must have been a self-closing tag that we didn't identify as a void element
// 					// (e.g. an SVG tag). Pop it off the stack as if we had encountered its close tag.
// 					// @ts-ignore
// 					closeTag(token.end, token.endPos)
// 				} else {
// 					// We're ending an open tag. Record the end of the open tag as the end of the
// 					// range. (If we later find a close tag for this tag, the end will get overwritten
// 					// with the end of the close tag. In the case of a self-closing tag, we should never
// 					// encounter that.)
// 					// Note that we don't need to update the signature here because the signature only
// 					// relies on the tag name and ID, and isn't affected by the tag's attributes, so
// 					// the signature we calculated when creating the tag is still the same. If we later
// 					// find a close tag for this tag, we'll update the signature to account for its
// 					// children at that point (in the next "else" case).
// 					context.currentTag.openEnd = context.currentTag.end =
// 						context.startOffset + token.end
// 					context.currentTag.endPos = addPos(
// 						context.startOffsetPos,
// 						token.endPos
// 					)
// 					lastClosedTag = context.currentTag
// 					updateAttributeSignature(context.currentTag)
// 					context.currentTag = undefined
// 				}
// 			}
// 		} else if (token.type === 'closetag') {
// 			// If this is a self-closing element, ignore the close tag.
// 			const closeTagName = token.contents.toLowerCase()
// 			if (!voidElements.hasOwnProperty(closeTagName)) {
// 				// Find the topmost item on the stack that matches. If we can't find one, assume
// 				// this is just a dangling closing tag and ignore it.
// 				// eslint-disable-next-line no-var
// 				var i
// 				for (i = stack.length - 1; i >= 0; i--) {
// 					if (stack[i].tag === closeTagName) {
// 						break
// 					}
// 				}

// 				if (strict && i !== stack.length - 1) {
// 					// If we're in strict mode, treat unbalanced tags as invalid.
// 					logError(context, token)
// 					return {
// 						dom: undefined,
// 						errors: context.errors,
// 					}
// 				}

// 				if (i >= 0) {
// 					do {
// 						// For all tags we're implicitly closing (before we hit the matching tag), we want the
// 						// implied end to be the beginning of the close tag (which is two characters, "</", before
// 						// the start of the tagname). For the actual tag we're explicitly closing, we want the
// 						// implied end to be the end of the close tag (which is one character, ">", after the end of
// 						// the tagname).
// 						if (stack.length === i + 1) {
// 							// @ts-ignore
// 							closeTag(token.end + 1, offsetPos(token.endPos, 1))
// 						} else {
// 							// @ts-ignore
// 							closeTag(token.start - 2, offsetPos(token.startPos, -2))
// 						}
// 					} while (stack.length > i)
// 				} else {
// 					// If we're in strict mode, treat unmatched close tags as invalid. Otherwise
// 					// we just silently ignore them.
// 					if (strict) {
// 						logError(context, token)
// 						return {
// 							dom: undefined,
// 							errors: context.errors,
// 						}
// 					}
// 				}
// 			}
// 		} else if (token.type === 'attribname') {
// 			attributeName = token.contents.toLowerCase()
// 			// Set the value to the empty string in case this is an empty attribute. If it's not,
// 			// it will get overwritten by the attribvalue later.
// 			context.currentTag.attributes[attributeName] = ''
// 		} else if (token.type === 'attribvalue' && attributeName !== null) {
// 			context.currentTag.attributes[attributeName] = token.contents
// 			attributeName = null
// 		} else if (token.type === 'text') {
// 			if (stack.length) {
// 				const parent = stack[stack.length - 1]
// 				/**
// 				 * @type {SimpleNode}
// 				 */
// 				let newNode
// 				// Check to see if we're continuing a previous text.
// 				if (lastTextNode) {
// 					newNode = lastTextNode
// 					newNode.content += token.contents
// 				} else {
// 					newNode = {
// 						parent: stack[stack.length - 1],
// 						content: token.contents,
// 					}
// 					parent.children.push(newNode)
// 					newNode.tagId = getTextNodeID(newNode)
// 					nodeMap[newNode.tagId] = newNode
// 					lastTextNode = newNode
// 				}

// 				update(newNode)
// 			}
// 		}
// 	}

// 	// If we have any tags hanging open (e.g. html or body), fail the parse if we're in strict mode,
// 	// otherwise close them at the end of the document.
// 	if (stack.length) {
// 		if (strict) {
// 			logError(context, token)
// 			return {
// 				dom: undefined,
// 				errors: context.errors,
// 			}
// 		}

// 		// Manually compute the position of the end of the text (we can't rely on the
// 		// tokenizer for this since it may not get to the very end)
// 		// TODO: should probably make the tokenizer get to the end...
// 		const lines = context.text.split('\n')
// 		const lastPos = {
// 			line: lines.length - 1,
// 			ch: lines[lines.length - 1].length,
// 		}
// 		while (stack.length) {
// 			closeTag(context.text.length, lastPos)
// 		}
// 	}

// 	const dom = lastClosedTag
// 	if (!dom) {
// 		// This can happen if the document has no nontrivial content, or if the user tries to
// 		// have something at the root other than the HTML tag. In all such cases, we treat the
// 		// document as invalid.
// 		logError(context, token)
// 		return {
// 			dom: undefined,
// 			errors: context.errors,
// 		}
// 	}

// 	dom.nodeMap = nodeMap
// 	return {dom, errors: context.errors}
// }

// /**
//  * Returns the best tag Id for the new tag object given.
//  * and returns a unique Id.
//  *
//  * @return {number} unique tag id
//  */
// function getId() {
// 	return tagId++
// }
