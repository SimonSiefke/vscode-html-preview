import {createParser} from '../parse/parse';

// TODO optimize all this spaghetti code

/**
 * Determines the changes made to attributes and generates edits for those changes.
 *
 * @param oldNode - node from old tree
 * @param newNode - node from new tree
 * @return list of edits to mutate attributes from the old node to the new
 */
function attributeEdits(oldNode: {attributes: any; id: any}, newNode: {attributes: any}) {
	const oldAttributes = {...oldNode.attributes};
	const newAttributes = newNode.attributes;
	oldAttributes;
	newAttributes;
	const edits: any[] = [];

	for (const attributeName of Object.keys(newAttributes)) {
		if (
			Object.prototype.hasOwnProperty.call(oldAttributes, attributeName) !==
				Object.prototype.hasOwnProperty.call(newAttributes, attributeName) ||
			oldAttributes[attributeName] !== newAttributes[attributeName]
		) {
			const type = Object.prototype.hasOwnProperty.call(oldAttributes, attributeName) ?
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

function elementDelete(node: {id: any}) {
	return {
		command: 'elementDelete',
		payload: {
			id: node.id
		}
	};
}

function elementInsert(
	node: {
	type: string
	id: any
	tag: any
	attributes: any
	children: {flatMap: (arg0: (child: any, index: any) => any[]) => void}
	text: any
	},
	parentId: number,
	index: number,
	nodeMap
) {
	const beforeElement = nodeMap[parentId].children[index - 1];

	const beforeElementId = (beforeElement && beforeElement.id) || 0;
	if (node.type === 'ElementNode') {
		return [
			{
				command: 'elementInsert',
				payload: {
					id: node.id,
					nodeType: node.type,
					tag: node.tag,
					parentId,
					beforeId: beforeElementId,
					attributes: node.attributes
				}
			},
			// @ts-ignore
			...node.children.flatMap((child: any, index: any) =>
				elementInsert(child, node.id, index, nodeMap)
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
					index,
					beforeId: beforeElementId
				}
			}
		];
	}

	console.log(node);

	throw new Error('invalid node');
}

function textReplace(node: {id: any; text: any}) {
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
export function diff(
	oldNodes: any[],
	newNodes: any[],
	{parentId = 0, oldNodeMap = {}, newNodeMap = {}} = {}
) {
	let oldIndex: number = 0;
	let newIndex: number = 0;
	let edits: any[] = [];

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
					edits = [...edits, ...attributeEdits(oldNode, newNode)];
				}

				if (newNode.subtreeSignature !== oldNode.subtreeSignature) {
					edits = [
						...edits,
						...diff(oldNode.children, newNode.children, {
							parentId: newNode.id,
							oldNodeMap,
							newNodeMap
						})
					];
				}

				oldIndex++;
				newIndex++;
				continue;
			} else if (!newNodeMap[oldNode.id]) {
				oldNode;
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
				continue;
			} else if (!oldNodeMap[newNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)];
				newIndex++;
				continue;
			} else {
				newNodeMap;
				newNode;
				oldNode;
				// Edits = [...edits, ...elementInsert(newNode, parentId, newIndex)];
				// newIndex++;
				// OldNodeMap;
				// newNodeMap;
				// oldNode;
				// newNode;
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
		}

		if (newNode.type === 'ElementNode' && oldNode.type !== 'ElementNode') {
			if (!newNodeMap[oldNode.id]) {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
				continue;
			} else if (!oldNodeMap[newNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)];
				newIndex++;
			} else {
				edits = [
					...edits,
					elementDelete(oldNode),
					...elementInsert(newNode, parentId, newIndex, newNodeMap)
				];
				oldIndex++;
				newIndex++;
				continue;
				// Throw new Error('cannot determine diff');
			}

			// If()
			// oldNode;
			// newNode;
			// edits = [
			// 	...edits,
			// 	elementDelete(oldNode),
			// 	...elementInsert(newNode, parentId, newIndex - 1)
			// ];
			// oldIndex++;
			// newIndex++;
			continue;
		}

		if (newNode.type !== 'ElementNode' && oldNode.type === 'ElementNode') {
			if (newNodeMap[oldNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)];
				newIndex++;
				continue;
			} else {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
				continue;
			}

			continue;
		}

		if (newNode.type !== oldNode.type) {
			if (oldNode.id === newNode.id) {
				edits = [...edits, textReplace(newNode)];
				oldIndex++;
				newIndex++;
				continue;
			} else if (!newNodeMap[oldNode.id]) {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
				continue;
			} else if (!oldNodeMap[newNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)];
				newIndex++;
				continue;
			} else {
				edits = [
					...edits,
					elementDelete(oldNode),
					...elementInsert(newNode, parentId, newIndex, newNodeMap)
				];
				oldIndex++;
				newIndex++;
				continue;
				// Throw new Error('cannot determine diff');
			}
		}

		if (
			((newNode.type === 'TextNode' && oldNode.type === 'TextNode') ||
				(newNode.type === 'CommentNode' && oldNode.type === 'CommentNode')) &&
			newNode.textSignature !== oldNode.textSignature
		) {
			if (oldNode.id === newNode.id) {
				edits = [...edits, textReplace(newNode)];
				oldIndex++;
				newIndex++;
				continue;
			} else if (!newNodeMap[oldNode.id]) {
				edits = [...edits, elementDelete(oldNode)];
				oldIndex++;
				continue;
			} else if (!oldNodeMap[newNode.id]) {
				edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)];
				newIndex++;
				continue;
			} else {
				edits = [
					...edits,
					elementDelete(oldNode),
					...elementInsert(newNode, parentId, newIndex, newNodeMap)
				];
				oldIndex++;
				newIndex++;
				continue;
				// Throw new Error('cannot determine diff');
			}
		}

		oldNode;
		newNode;
		oldIndex++;
		newIndex++;
		// Continue;
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

		edits = [...edits, ...elementInsert(newNode, parentId, newIndex - 1, newNodeMap)];
	}

	return edits;
}

const pretty = (node: {
type: string
tag: any
children: {
map: (
	arg0: (
		node: any
	) =>
	| {
	tag: any
	children: any
	id: any
	attributes: any
	type?: undefined
	text?: undefined
				  }
	| {
	type: any
	text: any
	id: any
	tag?: undefined
	children?: undefined
	attributes?: undefined
				  }
) => void
}
id: any
attributes: any
text: any
}) => {
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

// @ts-ignore
Array.prototype.pretty = function () {
	return JSON.stringify(
		this.map(pretty),
		(k, v) => {
			return v === undefined ? null : v;
		},
		2
	);
};

// @ts-ignore
// Object.prototype.pretty = function () {
// 	return JSON.stringify(
// 		this.children.map(pretty),
// 		(k, v) => {
// 			return v === undefined ? null : v;
// 		},
// 		2
// 	);
// };

// const testCase = {
// 	previousDom: '<!doctype html>\n',

// 	nextDom: '<!doctype html>'
// };
// const parser = createParser();
// const parsedH1 = parser.parse(testCase.previousDom);
// const oldNodeMap = parser.nodeMap; // ?
// const parsedH2 = parser.edit(testCase.nextDom, [
// 	{
// 		rangeOffset: 15,
// 		rangeLength: 1,
// 		text: ''
// 	}
// ]);
// const newNodeMap = parser.nodeMap; // ?
// parsedH1.pretty(); // ?
// parsedH2.pretty(); // ?
// diff(parsedH1, parsedH2, {
// 	oldNodeMap,
// 	newNodeMap
// }); // ?
