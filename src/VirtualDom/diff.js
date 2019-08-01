/* eslint-disable no-negated-condition */
// @ts-nocheck
import {createParser} from './parse';

/* eslint-disable valid-jsdoc */
/* eslint-disable complexity */
/**
 * Determines the changes made to attributes and generates edits for those changes.
 *
 * @param {SimpleNode} oldNode node from old tree
 * @param {SimpleNode} newNode node from new tree
 * @return {Array.<Object>} list of edits to mutate attributes from the old node to the new
 */
function attributeEdits(oldNode, newNode) {
	const oldAttributes = {...oldNode.attributes};
	const newAttributes = newNode.attributes;
	oldAttributes;
	newAttributes;
	const edits = [];

	for (const attributeName of Object.keys(newAttributes)) {
		if (
			Object.prototype.hasOwnProperty.call(oldAttributes, attributeName) !==
				Object.prototype.hasOwnProperty.call(newAttributes, attributeName) ||
			oldAttributes[attributeName] !== newAttributes[attributeName]
		) {
			const type = Object.prototype.hasOwnProperty.call(
				oldAttributes,
				attributeName
			) ?
				'attributeChange' :
				'attributeAdd';
			edits.push({
				command: type,
				payload: {
					id: oldNode.id,
					attribute: attributeName,
					value: newAttributes[attributeName]
				}
			});
		}

		delete oldAttributes[attributeName];
	}

	for (const attributeName of Object.keys(oldAttributes)) {
		edits.push({
			command: 'attributeDelete',
			payload: {
				id: oldNode.id,
				attribute: attributeName
			}
		});
	}

	return edits;
}

// GenerateAttributeEdits(
// 	{
// 		tag: 'h1',
// 		id: 1,
// 		attributes: {
// 			class: 'red',
// 			id: '2'
// 		}
// 	},
// 	{
// 		tag: 'h1',
// 		id: 1,
// 		attributes: {
// 			class: undefined,
// 			id: '2'
// 		}
// 	}
// ); // ?

/**
 * @param {any} node
 * @return {number|undefined}
 */
function getParentId(node) {
	return node.parent && node.parent.id;
}

/**
 *
 * When the main loop (see below) determines that something has changed with
 * an element's immediate children, it calls this function to create edit
 * operations for those changes.
 *
 * This adds to the edit list in place and does not return anything.
 *
 * @param {?Object} oldParent SimpleDOM node for the previous state of this element, undefined if the element is new
 * @param {Object} newParent SimpleDOM node for the current state of the element
 */
// const generateChildEdits = function (
// 	oldParent,
// 	oldNodeMap,
// 	newParent,
// 	newNodeMap
// ) {
// 	let newIndex = 0;
// 	let oldIndex = 0;
// 	const newChildren = newParent.children;
// 	const oldChildren = oldParent ? oldParent.children : [];
// 	let newChild;
// 	let oldChild;
// 	let newEdits = [];
// 	let newEdit;
// 	let textAfterId;
// 	const edits = [];
// 	const moves = [];
// 	const newElements = [];

// 	/**
// 	 * We initially put new edit objects into the `newEdits` array so that we
// 	 * can fix them up with proper positioning information. This function is
// 	 * responsible for doing that fixup.
// 	 *
// 	 * The `beforeID` that appears in many edits tells the browser to make the
// 	 * change before the element with the given ID. In other words, an
// 	 * elementInsert with a `beforeID` of 32 would result in something like
// 	 * `parentElement.insertBefore(newChildElement, _queryBracketsID(32))`
// 	 *
// 	 * Many new edits are captured in the `newEdits` array so that a suitable
// 	 * `beforeID` can be added to them before they are added to the main edits
// 	 * list. This function sets the `beforeID` on any pending edits and adds
// 	 * them to the main list.
// 	 *
// 	 * If this item is not being deleted, then it will be used as the `afterId`
// 	 * for text edits that follow.
// 	 *
// 	 * @param {number} beforeID ID to set on the pending edits
// 	 * @param {boolean} isBeingDeleted true if the given item is being deleted. If so,
// 	 *     we can't use it as the `afterId` for future edits--whatever previous item
// 	 *     was set as the `textAfterId` is still okay.
// 	 */
// 	const finalizeNewEdits = function (beforeId, isBeingDeleted) {
// 		newEdits.forEach(edit => {
// 			// ElementDeletes don't need any positioning information
// 			if (edit.type !== 'elementDelete') {
// 				edit.beforeID = beforeId;
// 			}
// 		});
// 		edits.push.apply(edits, newEdits);
// 		newEdits = [];

// 		// If the item we made this set of edits relative to
// 		// is being deleted, we can't use it as the afterID for future
// 		// edits. It's okay to just keep the previous afterID, since
// 		// this node will no longer be in the tree by the time we get
// 		// to any future edit that needs an afterID.
// 		if (!isBeingDeleted) {
// 			textAfterId = beforeId;
// 		}
// 	};

// 	/**
// 	 * If the current element was not in the old DOM, then we will create
// 	 * an elementInsert edit for it.
// 	 *
// 	 * If the element was in the old DOM, this will return false and the
// 	 * main loop will either spot this element later in the child list
// 	 * or the element has been moved.
// 	 *
// 	 * @return {boolean} true if an elementInsert was created
// 	 */
// 	const addElementInsert = () => {
// 		if (!oldNodeMap[newChild.id]) {
// 			if (newChild.type === 'ElementNode') {
// 				newEdit = {
// 					type: 'elementInsert',
// 					nodeType: 'ElementNode',
// 					tag: newChild.tag,
// 					id: newChild.id,
// 					parentId: newChild.parent.id,
// 					attributes: newChild.attributes
// 				};
// 			} else if (newChild.type === 'TextNode') {
// 				newEdit = {
// 					type: 'elementInsert',
// 					nodeType: 'TextNode',
// 					id: newChild.id,
// 					parentId: newChild.parent.id
// 				};
// 			} else if (newChild.type === 'CommentNode') {
// 				newEdit = {
// 					type: 'elementInsert',
// 					nodeType: 'CommentNode',
// 					id: newChild.id,
// 					parentId: newChild.parent.id
// 				};
// 			} else {
// 				throw new Error('unknown node type');
// 			}

// 			newEdits.push(newEdit);

// 			// This newly inserted node needs to have edits generated for its
// 			// children, so we add it to the queue.
// 			newElements.push(newChild);

// 			// New element means we need to move on to compare the next
// 			// of the current tree with the one from the old tree that we
// 			// just compared
// 			newIndex++;
// 			return true;
// 		}

// 		return false;
// 	};

// 	/**
// 	 * If the old element that we're looking at does not appear in the new
// 	 * DOM, that means it was deleted and we'll create an elementDelete edit.
// 	 *
// 	 * If the element is in the new DOM, then this will return false and
// 	 * the main loop with either spot this node later on or the element
// 	 * has been moved.
// 	 *
// 	 * @return {boolean} true if elementDelete was generated
// 	 */
// 	const addElementDelete = function () {
// 		if (!newNodeMap[oldChild.id]) {
// 			// We can finalize existing edits relative to this node *before* it's
// 			// deleted.
// 			finalizeNewEdits(oldChild.id, true);

// 			newEdit = {
// 				type: 'elementDelete',
// 				id: oldChild.id
// 			};
// 			newEdits.push(newEdit);

// 			// Deleted element means we need to move on to compare the next
// 			// of the old tree with the one from the current tree that we
// 			// just compared
// 			oldIndex++;
// 			return true;
// 		}

// 		return false;
// 	};

// 	/**
// 	 * Finds the previous child of the new tree.
// 	 *
// 	 * @return {?Object} previous child or undefined if there wasn't one
// 	 */
// 	const prevNode = () => {
// 		if (newIndex > 0) {
// 			return newParent.children[newIndex - 1];
// 		}

// 		return undefined;
// 	};

// 		// When elements are deleted or moved from the old set of children, you
// 		// can end up with multiple text nodes in a row. A single textReplace edit
// 		// will take care of those (and will contain all of the right content since
// 		// the text nodes between elements in the new DOM are merged together).
// 		// The check below looks to see if we're already in the process of adding
// 		// a textReplace edit following the same element.
// 		const previousEdit = newEdits.length > 0 && newEdits[newEdits.length - 1];
// 		if (
// 			previousEdit &&
// 			previousEdit.type === 'textReplace' &&
// 			previousEdit.afterId === textAfterId
// 		) {
// 			oldIndex++;
// 			return;
// 		}

// 		newEdit.parentId = oldChild.parent.id;

// 		// If there was only one child previously, we just pass along
// 		// textDelete/textReplace with the parentID and the browser will
// 		// clear all of the children
// 		if (oldChild.parent.children.length === 1) {
// 			newEdits.push(newEdit);
// 		} else {
// 			if (textAfterId) {
// 				newEdit.afterId = textAfterId;
// 			}

// 			newEdits.push(newEdit);
// 		}

// 		// This text appeared in the old tree but not the new one, so we
// 		// increment the old children counter.
// 		oldIndex++;
// 	};

// 	/**
// 	 * Adds an elementMove edit if the parent has changed between the old and new trees.
// 	 * These are fairly infrequent and generally occur if you make a change across
// 	 * tag boundaries.
// 	 *
// 	 * @return {boolean} true if an elementMove was generated
// 	 */
// 	// const addElementMove = function () {
// 	// 	// This check looks a little strange, but it suits what we're trying
// 	// 	// to do: as we're walking through the children, a child node that has moved
// 	// 	// from one parent to another will be found but would look like some kind
// 	// 	// of insert. The check that we're doing here is looking up the current
// 	// 	// child's ID in the *old* map and seeing if this child used to have a
// 	// 	// different parent.
// 	// 	const possiblyMovedElement = oldNodeMap[newChild.id];
// 	// 	if (
// 	// 		possiblyMovedElement &&
// 	// 		newParent.id !== getParentId(possiblyMovedElement)
// 	// 	) {
// 	// 		newEdit = {
// 	// 			type: 'elementMove',
// 	// 			id: newChild.id,
// 	// 			parentId: newChild.parent.id
// 	// 		};
// 	// 		moves.push(newEdit.id);
// 	// 		newEdits.push(newEdit);

// 	// 		// This element in the new tree was a move to this spot, so we can move
// 	// 		// on to the next child in the new tree.
// 	// 		newIndex++;
// 	// 		return true;
// 	// 	}

// 	// 	return false;
// 	// };

// 	/**
// 	 * Looks to see if the element in the old tree has moved by checking its
// 	 * current and former parents.
// 	 *
// 	 * @return {boolean} true if the element has moved
// 	 */
// 	// const hasMoved = function (oldChild) {
// 	// 	const oldChildInNewTree = newNodeMap[oldChild.id];

// 	// 	return (
// 	// 		oldChild.children &&
// 	// 		oldChildInNewTree &&
// 	// 		getParentId(oldChild) !== getParentId(oldChildInNewTree)
// 	// 	);
// 	// };

// 	// Loop through the current and old children, comparing them one by one.
// 	while (newIndex < newChildren.length && oldIndex < oldChildren.length) {
// 		newChild = newChildren[newIndex];

// 		// Check to see if the currentChild has been reparented from somewhere
// 		// else in the old tree
// 		// if (newChild.children && addElementMove()) {
// 		// 	continue;
// 		// }

// 		oldChild = oldChildren[oldIndex];

// 		// Check to see if the oldChild has been moved to another parent.
// 		// If it has, we deal with it on the other side (see above)
// 		// if (hasMoved(oldChild)) {
// 		// 	oldIndex++;
// 		// 	continue;
// 		// }

// 		if (newChild.type==='ElementNode' || oldChild.type==='ElementNode') {
// 			if (isElement(newChild) && isText(oldChild)) {
// 				addTextDelete();

// 				// If this element is new, add it and move to the next child
// 				// in the current tree. Otherwise, we'll compare this same
// 				// current element with the next old element on the next pass
// 				// through the loop.
// 				addElementInsert();
// 			} else if (oldChild.type==='ElementNode' && isText(newChild)) {
// 				// If the old child has *not* been deleted, we assume that we've
// 				// inserted some text and will still encounter the old node
// 				if (!addElementDelete()) {
// 					addTextInsert();
// 				}

// 				// Both children are elements
// 			} else if (newChild.id !== oldChild.id) {
// 				// First, check to see if we're deleting an element.
// 				// If we are, get rid of that element and restart our comparison
// 				// logic with the same element from the new tree and the next one
// 				// from the old tree.
// 				if (!addElementDelete()) {
// 					// Since we're not deleting and these elements don't match up, we
// 					// must have a new element. Add an elementInsert (and log a problem
// 					// if no insert works.)
// 					if (!addElementInsert()) {
// 						console.error(
// 							'HTML Instrumentation: This should not happen. Two elements have different tag IDs and there was no insert/delete. This generally means there was a reordering of elements.'
// 						);
// 						newIndex++;
// 						oldIndex++;
// 					}
// 				}

// 				// There has been no change in the tag we're looking at.
// 			} else {
// 				// Since this element hasn't moved, it is a suitable "beforeID"
// 				// for the edits we've logged.
// 				finalizeNewEdits(oldChild.id, false);
// 				newIndex++;
// 				oldIndex++;
// 			}

// 			// We know we're comparing two texts. Just match up their signatures.
// 		} else {
// 			if (newChild.textSignature !== oldChild.textSignature) {
// 				newEdit = {
// 					type: 'textReplace',
// 					content: newChild.content,
// 					parentId: newChild.parent.id
// 				};
// 				if (textAfterId) {
// 					newEdit.afterId = textAfterId;
// 				}

// 				newEdits.push(newEdit);
// 			}

// 			// Either we've done a text replace or both sides matched. In either
// 			// case we're ready to move forward among both the old and new children.
// 			newIndex++;
// 			oldIndex++;
// 		}
// 	}

// 	// At this point, we've used up all of the children in at least one of the
// 	// two sets of children.

// 	/**
// 	 * Take care of any remaining children in the old tree.
// 	 */
// 	while (oldIndex < oldChildren.length) {
// 		oldChild = oldChildren[oldIndex];

// 		// Check for an element that has moved
// 		if (hasMoved(oldChild)) {
// 			// This element has moved, so we skip it on this side (the move
// 			// is handled on the new tree side).
// 			oldIndex++;

// 			// Is this an element? if so, delete it
// 		} else if (isElement(oldChild)) {
// 			if (!addElementDelete()) {
// 				console.error(
// 					'HTML Instrumentation: failed to add elementDelete for remaining element in the original DOM. This should not happen.',
// 					oldChild
// 				);
// 				oldIndex++;
// 			}

// 			// Must be text. delete that.
// 		} else {
// 			addTextDelete();
// 		}
// 	}

// 	/**
// 	 * Take care of the remaining children in the new tree.
// 	 */
// 	while (newIndex < newChildren.length) {
// 		newChild = newChildren[newIndex];

// 		// Is this an element?
// 		if (isElement(newChild)) {
// 			// Look to see if the element has moved here.
// 			if (!addElementMove()) {
// 				// Not a move, so we insert this element.
// 				if (!addElementInsert()) {
// 					console.error(
// 						'HTML Instrumentation: failed to add elementInsert for remaining element in the updated DOM. This should not happen.'
// 					);
// 					newIndex++;
// 				}
// 			}

// 			// Not a new element, so it must be new text.
// 		} else {
// 			addTextInsert();
// 		}
// 	}

// 	/**
// 	 * Finalize remaining edits. For inserts and moves, we can set the `lastChild`
// 	 * flag and the browser can simply use `appendChild` to add these items.
// 	 */
// 	// newEdits.forEach(edit => {
// 	// 	if (
// 	// 		edit.type === 'textInsert' ||
// 	// 		edit.type === 'elementInsert' ||
// 	// 		edit.type === 'elementMove'
// 	// 	) {
// 	// 		edit.lastChild = true;
// 	// 		delete edit.firstChild;
// 	// 		delete edit.afterId;
// 	// 	}
// 	// });
// 	// edits.push.apply(edits, newEdits);

// 	return {
// 		edits,
// 		// moves,
// 		// newElements
// 	};
// };

function elementDelete(node) {
	return {
		command: 'elementDelete',
		payload: {
			id: node.id
		}
	};
}

function elementInsert(node, parentId, index) {
	if (node.type === 'ElementNode') {
		return [
			{
				command: 'elementInsert',
				payload: {
					id: node.id,
					nodeType: node.type,
					tag: node.tag,
					parentId,
					index,
					attributes: node.attributes
				}
			},
			...node.children.flatMap((child, index) =>
				elementInsert(child, node.id, index)
			)
		];
	}

	if (node.type === 'TextNode' || node.type === 'CommentNode') {
		return [
			{
				command: 'elementInsert',
				payload: {
					nodeType: node.type,
					id: node.id,
					text: node.text,
					parentId,
					index
				}
			}
		];
	}

	throw new Error('invalid node');
}

function textReplace(node) {
	return {
		command: 'textReplace',
		payload: {
			id: node.id,
			text: node.text
		}
	};
}

/**
 * Generate a list of edits that will mutate oldNode to look like newNode.
 * Currently, there are the following possible edit operations:
 *
 * * elementInsert
 * * elementDelete
 * * elementMove
 * * textInsert
 * * textDelete
 * * textReplace
 * * attrDelete
 * * attrChange
 * * attrAdd
 * * rememberNodes (a special instruction that reflects the need to hang on to moved nodes)
 *
 * @param {Object} oldNode SimpleDOM node with the original content
 * @param {Object} newNode SimpleDOM node with the new content
 * @return {Array<Object>} list of edit operations
 */
export function domdiff(
	oldNodes,
	newNodes,
	{parentId = 0, oldNodeMap = {}, newNodeMap = {}} = {}
) {
	/**
	 * @type{number}
	 */
	let oldIndex = 0;
	/**
	 * @type{number}
	 */
	let newIndex = 0;
	/**
	 * @type{any}
	 */
	let edits = [];

	/**
	 * Take care of common nodes
	 */
	while (newIndex < newNodes.length && oldIndex < oldNodes.length) {
		const newNode = newNodes[newIndex];
		const oldNode = oldNodes[oldIndex];

		oldNode.type; // ?
		newNode.type; // ?
		oldNode.subtreeSignature; // ?
		newNode.subtreeSignature; // ?

		if (newNode.type === 'ElementNode' && oldNode.type === 'ElementNode') {
			if (newNode.id === oldNode.id) {
				if (newNode.attributeSignature !== oldNode.attributeSignature) {
					edits = [...edits, ...attributeEdits(oldNode, newNode, newIndex - 1)];
				}

				if (newNode.subtreeSignature !== oldNode.subtreeSignature) {
					edits = [
						...edits,
						...domdiff(oldNode.children, newNode.children, {
							parentId: newNode.id,
							oldNodeMap,
							newNodeMap
						})
					];
				}
			} else if (!newNodeMap[oldNode.id]) {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
			} else if (!oldNodeMap[newNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex)];
				newIndex++;
			} else {
				oldNodeMap;
				newNodeMap;
				oldNode;
				newNode;
				throw new Error('cannot determine diff');
			}
			// Const newAttributeSignature = newNode.attributeSignature

			// if (newNode.attributeSignature === oldNode.attributeSignature) {
			// 	oldIndex++;
			// 	newIndex++;
			// 	continue;
			// }

			// if (newNode.subtreeSignature === oldNode.subtreeSignature) {
			// }

			oldIndex++;
			newIndex++;
			continue;
		}

		if (newNode.type === 'ElementNode' && oldNode.type !== 'ElementNode') {
			edits = [
				...edits,
				elementDelete(oldNode),
				...elementInsert(newNode, parentId, newIndex - 1)
			];
			oldIndex++;
			newIndex++;
			continue;
		}

		if (newNode.type !== 'ElementNode' && oldNode.type === 'ElementNode') {
			if (newNodeMap[oldNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex - 1)];
				newIndex++;
			} else {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
			}

			continue;
		}

		if (newNode.type !== oldNode.type) {
			edits = [
				...edits,
				elementDelete(oldNode),
				...elementInsert(newNode, parentId, newIndex - 1)
			];
			oldIndex++;
			newIndex++;
			continue;
		}

		if (
			((newNode.type === 'TextNode' && oldNode.type === 'TextNode') ||
				(newNode.type === 'CommentNode' && oldNode.type === 'CommentNode')) &&
			newNode.textSignature !== oldNode.textSignature
		) {
			edits = [...edits, textReplace(newNode)];
			oldIndex++;
			newIndex++;
			continue;
		}

		oldIndex++;
		newIndex++;
		continue;
	}

	/**
	 * Take care of any remaining nodes in the old tree.
	 */
	while (oldIndex < oldNodes.length) {
		const oldNode = oldNodes[oldIndex];
		oldIndex++;
		edits = [...edits, elementDelete(oldNode)];
	}

	/**
	 * Take care of the remaining nodes in the new tree.
	 */
	while (newIndex < newNodes.length) {
		const newNode = newNodes[newIndex];
		newIndex++;
		edits = [...edits, ...elementInsert(newNode, parentId, newIndex - 1)];
	}

	return edits;
}

const pretty = node => {
	if (node.type === 'ElementNode') {
		return {
			tag: node.tag,
			children: node.children.map(pretty),
			id: node.id,
			attributes: node.attributes
		};
	}

	return {
		type: node.type,
		text: node.text,
		id: node.id
	};
};

Array.prototype.pretty = function () {
	return JSON.stringify(
		this.map(pretty),
		(k, v) => {
			return v === undefined ? null : v;
		},
		2
	);
};

const testCase = {
	previousDom: '<h1 >hello world</h1>',
	nextDom: '<h1 class>hello world</h1>'
};

const parser = createParser();

const parsedH1 = parser.parse(testCase.previousDom);
const oldNodeMap = parser.nodeMap; // ?
const parsedH2 = parser.edit(testCase.nextDom, [
	{rangeOffset: 4, text: 'class', rangeLength: 0}
]);
const newNodeMap = parser.nodeMap; // ?
parsedH1.pretty(); // ?
parsedH2.pretty(); // ?
domdiff(parsedH1, parsedH2, {
	oldNodeMap,
	newNodeMap
}); // ?

// parseHTML(testCase.nextDom).pretty(); // ?
