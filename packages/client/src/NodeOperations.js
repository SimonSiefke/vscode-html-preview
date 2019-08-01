/* eslint-disable valid-jsdoc */
/* eslint-disable no-undef */
// @ts-nocheck
/**
 *
 * @param {string} text
 * @return {Text}
 */
export function createTextNode(text) {
	return document.createTextNode(text);
}

/**
 *
 * @param {string} text
 * @return {Comment}
 */
export function createComment(text) {
	return document.createComment(text);
}

/**
 *
 * @param {Node} parentNode
 * @param {Node} newNode
 * @param {Node} referenceNode
 * @return {void}
 */
export function insertBefore(parentNode, newNode, referenceNode) {
	parentNode.insertBefore(newNode, referenceNode);
}

/**
 *
 * @param {Node} node
 * @param {Node} child
 * @return {void}
 */
export function removeChild(node, child) {
	node.removeChild(child);
}

/**
 *
 * @param {Node} node
 * @param {Node} child
 * @return {void}
 */
export function appendChild(node, child) {
	node.appendChild(child);
}

/**
 *
 * @param {Node} node
 * @return {Node|undefined}
 */
export function parentNode(node) {
	return node.parentNode;
}

/**
 *
 * @param {Node} node
 * @return {Node|undefined}
 */
export function nextSibling(node) {
	return node.nextSibling;
}

/**
 *
 * @param {Node} node
 * @param {string} text
 * @return {void}
 */
export function setTextContent(node, text) {
	node.textContent = text;
}

const $comment = createComment('hello');
$comment.data = 'yes';
