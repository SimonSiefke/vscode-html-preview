/* eslint-disable no-var */
/* eslint-disable no-lonely-if */
/* eslint-disable no-multi-assign */
/* eslint-disable no-warning-comments */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable  */

const {createTokenizer} = require('../HTMLTokenizer/HTMLTokenizer')
const MurmurHash3 = require('../murmurhash3_gc')

const seed = Math.floor(Math.random() * 65535)

let tagID = 1

/**
 * A list of tags whose start causes any of a given set of immediate parent
 * tags to close. This mostly comes from the HTML5 spec section on omitted close tags:
 * http://www.w3.org/html/wg/drafts/html/master/syntax.html#optional-tags
 * This doesn't handle general content model violations.
 */
const openImpliesClose = {
	li: {li: true},
	dt: {dd: true, dt: true},
	dd: {dd: true, dt: true},
	address: {p: true},
	article: {p: true},
	aside: {p: true},
	blockquote: {p: true},
	dir: {p: true},
	div: {p: true},
	dl: {p: true},
	fieldset: {p: true},
	footer: {p: true},
	form: {p: true},
	h1: {p: true},
	h2: {p: true},
	h3: {p: true},
	h4: {p: true},
	h5: {p: true},
	h6: {p: true},
	header: {p: true},
	hgroup: {p: true},
	hr: {p: true},
	main: {p: true},
	menu: {p: true},
	nav: {p: true},
	ol: {p: true},
	p: {p: true},
	pre: {p: true},
	section: {p: true},
	table: {p: true},
	ul: {p: true},
	rt: {rp: true, rt: true},
	rp: {rp: true, rt: true},
	optgroup: {optgroup: true, option: true},
	option: {option: true},
	tbody: {thead: true, tbody: true, tfoot: true},
	tfoot: {tbody: true},
	tr: {tr: true, th: true, td: true},
	th: {th: true, td: true},
	td: {thead: true, th: true, td: true},
	body: {head: true, link: true, script: true},
}

/**
 * A list of tags that are self-closing (do not contain other elements).
 * Mostly taken from http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
 */
const voidElements = {
	area: true,
	base: true,
	basefont: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	frame: true,
	hr: true,
	img: true,
	input: true,
	isindex: true,
	keygen: true,
	link: true,
	menuitem: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,
}

/**
 * @constructor
 *
 * A SimpleNode represents one node in a SimpleDOM tree. Each node can have
 * any set of properties on it, though there are a couple of assumptions made.
 * Elements will have `children` and `attributes` properties. Text nodes will have a `content`
 * property. All Elements will have a `tagID` and text nodes *can* have one.
 *
 * @param {Object} properties the properties provided will be set on the new object.
 */
function SimpleNode(properties) {
	for (const key in properties) {
		// @ts-ignore
		this[key] = properties[key]
	}
	// this = {...this, properties}
	// return Object.create(this, properties)
	// $.extend(this, properties)
}

SimpleNode.prototype = {
	/**
	 * Updates signatures used to optimize the number of comparisons done during
	 * diffing. This is important to call if you change:
	 *
	 * * children
	 * * child node attributes
	 * * text content of a text node
	 * * child node text
	 */
	update() {
		if (this.isElement()) {
			let i
			let subtreeHashes = ''
			let childHashes = ''
			let child
			for (i = 0; i < this.children.length; i++) {
				child = this.children[i]
				if (child.isElement()) {
					childHashes += String(child.tagID)
					subtreeHashes +=
						String(child.tagID) +
						child.attributeSignature +
						child.subtreeSignature
				} else {
					childHashes += child.textSignature
					subtreeHashes += child.textSignature
				}
			}

			this.childSignature = MurmurHash3.hashString(
				childHashes,
				childHashes.length,
				seed
			)
			this.subtreeSignature = MurmurHash3.hashString(
				subtreeHashes,
				subtreeHashes.length,
				seed
			)
		} else {
			this.textSignature = MurmurHash3.hashString(
				this.content,
				this.content.length,
				seed
			)
		}
	},

	/**
	 * Updates the signature of this node's attributes. Call this after making attribute changes.
	 */
	updateAttributeSignature() {
		const attributeString = JSON.stringify(this.attributes)
		this.attributeSignature = MurmurHash3.hashString(
			attributeString,
			attributeString.length,
			seed
		)
	},

	/**
	 * Is this node an element node?
	 *
	 * @return {boolean} true if it is an element
	 */
	isElement() {
		return Boolean(this.children)
	},

	/**
	 * Is this node a text node?
	 *
	 * @return {boolean} true if it is text
	 */
	isText() {
		return !this.children
	},
}

/**
 * @private
 *
 * Generates a synthetic ID for text nodes. These IDs are only used
 * for convenience when reading a SimpleDOM that is dumped to the console.
 *
 * @param {Object} textNode new node for which we are generating an ID
 * @return {string} ID for the node
 */
function getTextNodeID(textNode) {
	const childIndex = textNode.parent.children.indexOf(textNode)
	if (childIndex === 0) {
		return textNode.parent.tagID + '.0'
	}

	return textNode.parent.children[childIndex - 1].tagID + 't'
}

/**
 * @private
 *
 * Adds two {line, ch}-style positions, returning a new pos.
 */
function addPos(pos1, pos2) {
	return {
		line: pos1.line + pos2.line,
		ch: pos2.line === 0 ? pos1.ch + pos2.ch : pos2.ch,
	}
}

/**
 * @private
 *
 * Offsets the character offset of the given {line, ch} pos by the given amount and returns a new
 * pos. Not for general purpose use as it does not account for line boundaries.
 */
/**
 *
 * @param {Position} pos
 * @param {number} offset
 */
function offsetPos(pos, offset) {
	return {line: pos.line, ch: pos.ch + offset}
}

/**
 * @constructor
 *
 * A Builder creates a SimpleDOM tree of SimpleNode objects representing the
 * "important" contents of an HTML document. It does not include things like comments.
 * The nodes include information about their position in the text provided.
 *
 * @param {string} text The text to parse
 * @param {number} startOffset starting offset in the text
 * @param {{line: number, ch: number}} startOffsetPos line/ch position in the text
 */
function Builder(text, startOffset = 0, startOffsetPos = {line: 0, ch: 0}) {
	this.stack = []
	this.text = text
	this.t = createTokenizer(text)
	this.currentTag = null
	this.startOffset = startOffset || 0
	this.startOffsetPos = startOffsetPos || {line: 0, ch: 0}
}

Builder.prototype._logError = function(token) {
	const error = {token}
	const startPos = token ? token.startPos || token.endPos : this.startOffsetPos
	const endPos = token ? token.endPos : this.startOffsetPos

	error.startPos = addPos(this.startOffsetPos, startPos)
	error.endPos = addPos(this.startOffsetPos, endPos)

	if (!this.errors) {
		this.errors = []
	}

	this.errors.push(error)
}

/**
 * Builds the SimpleDOM.
 *
 * @param {boolean} strict if errors are detected, halt and return null
 * @param {object} markCache a cache that can be used in ID generation (is passed to `getID`)
 * @return {SimpleNode} root of tree or null if parsing failed
 */
Builder.prototype.build = function(strict, markCache = {}) {
	const self = this
	let token
	let lastClosedTag
	let lastTextNode
	const {stack} = this
	let attributeName = null
	const nodeMap = {}

	markCache = markCache || {}

	// Start timers for building full and partial DOMs.
	// Appropriate timer is used, and the other is discarded.
	// const timerBuildFull = 'HTMLInstr. Build DOM Full'
	// const timerBuildPart = 'HTMLInstr. Build DOM Partial'
	// PerfUtils.markStart([timerBuildFull, timerBuildPart]);

	function closeTag(endIndex, endPos) {
		lastClosedTag = stack[stack.length - 1]
		stack.pop()
		lastClosedTag.update()

		lastClosedTag.end = self.startOffset + endIndex
		lastClosedTag.endPos = addPos(self.startOffsetPos, endPos)
	}

	while ((token = this.t.nextToken()) !== undefined) {
		// LastTextNode is used to glue text nodes together
		// If the last node we saw was text but this one is not, then we're done gluing.
		// If this node is a comment, we might still encounter more text.
		if (token.type !== 'text' && token.type !== 'comment' && lastTextNode) {
			lastTextNode = null
		}

		if (token.type === 'error') {
			// PerfUtils.finalizeMeasurement(timerBuildFull); // Discard
			// PerfUtils.addMeasurement(timerBuildPart); // Use
			this._logError(token)
			return null
		}

		if (token.type === 'opentagname') {
			const newTagName = token.contents.toLowerCase()
			// eslint-disable-next-line no-var
			var newTag

			if (openImpliesClose.hasOwnProperty(newTagName)) {
				const closable = openImpliesClose[newTagName]
				while (
					stack.length > 0 &&
					closable.hasOwnProperty(stack[stack.length - 1].tag)
				) {
					// Close the previous tag at the start of this tag.
					// Adjust backwards for the < before the tag name.
					// @ts-ignore
					closeTag(token.start - 1, offsetPos(token.startPos, -1))
				}
			}

			newTag = new SimpleNode({
				tag: token.contents.toLowerCase(),
				children: [],
				attributes: {},
				parent: stack.length ? stack[stack.length - 1] : null,
				start: this.startOffset + token.start - 1,
				// @ts-ignore
				startPos: addPos(this.startOffsetPos, offsetPos(token.startPos, -1)), // Ok because we know the previous char was a "<"
			})
			newTag.tagID = this.getID(newTag, markCache)

			// During undo in particular, it's possible that tag IDs may be reused and
			// the marks in the document may be misleading. If a tag ID has been reused,
			// we apply a new tag ID to ensure that our edits come out correctly.
			if (nodeMap[newTag.tagID]) {
				newTag.tagID = this.getNewID()
			}

			nodeMap[newTag.tagID] = newTag
			if (newTag.parent) {
				newTag.parent.children.push(newTag)
			}

			this.currentTag = newTag

			if (voidElements.hasOwnProperty(newTag.tag)) {
				// This is a self-closing element.
				newTag.update()
			} else {
				stack.push(newTag)
			}
		} else if (token.type === 'opentagend' || token.type === 'selfclosingtag') {
			// TODO: disallow <p/>?
			if (this.currentTag) {
				if (
					token.type === 'selfclosingtag' &&
					stack.length &&
					stack[stack.length - 1] === this.currentTag
				) {
					// This must have been a self-closing tag that we didn't identify as a void element
					// (e.g. an SVG tag). Pop it off the stack as if we had encountered its close tag.
					// @ts-ignore
					closeTag(token.end, token.endPos)
				} else {
					// We're ending an open tag. Record the end of the open tag as the end of the
					// range. (If we later find a close tag for this tag, the end will get overwritten
					// with the end of the close tag. In the case of a self-closing tag, we should never
					// encounter that.)
					// Note that we don't need to update the signature here because the signature only
					// relies on the tag name and ID, and isn't affected by the tag's attributes, so
					// the signature we calculated when creating the tag is still the same. If we later
					// find a close tag for this tag, we'll update the signature to account for its
					// children at that point (in the next "else" case).
					this.currentTag.openEnd = this.currentTag.end =
						this.startOffset + token.end
					// @ts-ignore
					this.currentTag.endPos = addPos(this.startOffsetPos, token.endPos)
					lastClosedTag = this.currentTag
					this.currentTag.updateAttributeSignature()
					this.currentTag = null
				}
			}
		} else if (token.type === 'closetag') {
			// If this is a self-closing element, ignore the close tag.
			const closeTagName = token.contents.toLowerCase()
			if (!voidElements.hasOwnProperty(closeTagName)) {
				// Find the topmost item on the stack that matches. If we can't find one, assume
				// this is just a dangling closing tag and ignore it.
				// eslint-disable-next-line no-var
				var i
				for (i = stack.length - 1; i >= 0; i--) {
					if (stack[i].tag === closeTagName) {
						break
					}
				}

				if (strict && i !== stack.length - 1) {
					// If we're in strict mode, treat unbalanced tags as invalid.
					// @ts-ignore
					// PerfUtils.finalizeMeasurement(timerBuildFull);
					// @ts-ignore
					// PerfUtils.addMeasurement(timerBuildPart);
					this._logError(token)
					return null
				}

				if (i >= 0) {
					do {
						// For all tags we're implicitly closing (before we hit the matching tag), we want the
						// implied end to be the beginning of the close tag (which is two characters, "</", before
						// the start of the tagname). For the actual tag we're explicitly closing, we want the
						// implied end to be the end of the close tag (which is one character, ">", after the end of
						// the tagname).
						if (stack.length === i + 1) {
							// @ts-ignore
							closeTag(token.end + 1, offsetPos(token.endPos, 1))
						} else {
							// @ts-ignore
							closeTag(token.start - 2, offsetPos(token.startPos, -2))
						}
					} while (stack.length > i)
				} else {
					// If we're in strict mode, treat unmatched close tags as invalid. Otherwise
					// we just silently ignore them.
					if (strict) {
						// @ts-ignore
						// PerfUtils.finalizeMeasurement(timerBuildFull);
						// @ts-ignore
						// PerfUtils.addMeasurement(timerBuildPart);
						this._logError(token)
						return null
					}
				}
			}
		} else if (token.type === 'attribname') {
			attributeName = token.contents.toLowerCase()
			// Set the value to the empty string in case this is an empty attribute. If it's not,
			// it will get overwritten by the attribvalue later.
			this.currentTag.attributes[attributeName] = ''
		} else if (token.type === 'attribvalue' && attributeName !== null) {
			this.currentTag.attributes[attributeName] = token.contents
			attributeName = null
		} else if (token.type === 'text') {
			if (stack.length) {
				const parent = stack[stack.length - 1]
				var newNode

				// Check to see if we're continuing a previous text.
				if (lastTextNode) {
					newNode = lastTextNode
					newNode.content += token.contents
				} else {
					newNode = new SimpleNode({
						parent: stack[stack.length - 1],
						content: token.contents,
					})
					parent.children.push(newNode)
					newNode.tagID = getTextNodeID(newNode)
					nodeMap[newNode.tagID] = newNode
					lastTextNode = newNode
				}

				newNode.update()
			}
		}
	}

	// If we have any tags hanging open (e.g. html or body), fail the parse if we're in strict mode,
	// otherwise close them at the end of the document.
	if (stack.length) {
		if (strict) {
			// @ts-ignore
			// PerfUtils.finalizeMeasurement(timerBuildFull);
			// @ts-ignore
			// PerfUtils.addMeasurement(timerBuildPart);
			this._logError(token)
			return null
		}

		// Manually compute the position of the end of the text (we can't rely on the
		// tokenizer for this since it may not get to the very end)
		// TODO: should probably make the tokenizer get to the end...
		const lines = this.text.split('\n')
		const lastPos = {
			line: lines.length - 1,
			ch: lines[lines.length - 1].length,
		}
		while (stack.length) {
			closeTag(this.text.length, lastPos)
		}
	}

	const dom = lastClosedTag
	if (!dom) {
		// This can happen if the document has no nontrivial content, or if the user tries to
		// have something at the root other than the HTML tag. In all such cases, we treat the
		// document as invalid.
		this._logError(token)
		return null
	}

	dom.nodeMap = nodeMap
	// @ts-ignore
	// PerfUtils.addMeasurement(timerBuildFull); // Use
	// @ts-ignore
	// PerfUtils.finalizeMeasurement(timerBuildPart); // Discard

	return dom
}

/**
 * Returns a new tag ID.
 *
 * @return {number} unique tag ID
 */
Builder.prototype.getNewID = function() {
	return tagID++
}

/**
 * Returns the best tag ID for the new tag object given.
 * The default implementation just calls `getNewID`
 * and returns a unique ID.
 *
 * @param {Object} newTag tag object to potentially inspect to choose an ID
 * @return {int} unique tag ID
 */
Builder.prototype.getID = Builder.prototype.getNewID

/**
 * Builds a SimpleDOM from the text provided. If `strict` mode is true, parsing
 * will halt as soon as any error is seen and null will be returned.
 *
 * @param {string} text Text of document to parse
 * @param {boolean} strict True for strict parsing
 * @return {SimpleNode} root of tree or null if strict failed
 */
function build(text, strict) {
	const builder = new Builder(text)
	// @ts-ignore
	return builder.build(strict)
}

/**
 * @private
 *
 * Generates a string version of a SimpleDOM for debugging purposes.
 *
 * @param {SimpleNode} root root of the tree
 * @return {string} Text version of the tree.
 */
function _dumpDOM(root) {
	let result = ''
	let indent = ''

	function walk(node) {
		if (node.tag) {
			result +=
				indent +
				'TAG ' +
				node.tagID +
				' ' +
				node.tag +
				' ' +
				JSON.stringify(node.attributes) +
				'\n'
		} else {
			result += indent + 'TEXT ' + (node.tagID || '- ') + node.content + '\n'
		}

		if (node.isElement()) {
			indent += '  '
			node.children.forEach(walk)
			indent = indent.slice(2)
		}
	}

	walk(root)

	return result
}

// Public API
exports.build = build
exports.Builder = Builder
exports.SimpleNode = SimpleNode

// Private API
exports._dumpDOM = _dumpDOM
exports._offsetPos = offsetPos
exports._getTextNodeID = getTextNodeID
exports._seed = seed
