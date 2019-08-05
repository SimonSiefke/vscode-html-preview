// @ts-nocheck
/// <reference path="../types.ts" />

import {hash} from '../hash';

/** @typedef {import('../HTMLSimpleDomBuilder/HTMLSimpleDom.types').SimpleNode} Context */

/* eslint-disable no-var */
/* eslint-disable no-lonely-if */
/* eslint-disable no-multi-assign */
/* eslint-disable no-warning-comments */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable  */

const {createTokenizer} = require('../HTMLTokenizer/HTMLTokenizer')

/**
 *
 * A SimpleNode represents one node in a SimpleDOM tree. Each node can have
 * any set of properties on it, though there are a couple of assumptions made.
 * Elements will have `children` and `attributes` properties. Text nodes will have a `content`
 * property. All Elements will have a `tagId` and text nodes *can* have one.
 *
 * @param {Object} properties the properties provided will be set on the new object.
 */
function createSimpleNode(properties) {
	const context = properties
	for (const key in properties) {
		// @ts-ignore
		this[key] = properties[key]
	}
	// this = {...this, properties}
	// return Object.create(this, properties)
	// $.extend(this, properties)
}

/**
 * Updates signatures used to optimize the number of comparisons done during
 * diffing. This is important to call if you change:
 *
 * * children
 * * child node attributes
 * * text content of a text node
 * * child node text
 * @param {Context} node
 */
export function updateSignature(node) {
	if (isElement(node)) {
		let i
		let subtreeHashes = ''
		let childHashes = ''
		let child
		for (i = 0; i < node.children.length; i++) {
			child = node.children[i]
			if (isElement(child)) {
				childHashes += String(child.tagId)
				subtreeHashes +=
					String(child.tagId) +
					child.attributeSignature +
					child.subtreeSignature
			} else {
				childHashes += child.textSignature
				subtreeHashes += child.textSignature
			}
		}

		node.childSignature = hash(childHashes)
		node.subtreeSignature = hash(subtreeHashes)
	} else {
		node.textSignature = hash(node.content)
	}
}

/**
 * Updates the signature of this node's attributes. Call this after making attribute changes.
 * @param {Context} context
 */
export function updateAttributeSignature(context) {
	const attributeString = JSON.stringify(context.attributes)
	context.attributeSignature = hash(attributeString)
}

/**
 * Is this node an element node?
 *
 * @param {Context} context
 * @return {boolean} true if it is an element
 */
export function isElement(context) {
	return !!context.children
	// return context.children.length > 0
}

/**
 * Is this node a text node?
 *
 * @param {Context} context
 * @return {boolean} true if it is text
 */
export function isText(context) {
	return !context.children
}

// exports.SimpleNode = createSimpleNode

// Private API
// exports._seed = seed
