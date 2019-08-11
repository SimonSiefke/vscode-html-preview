/* eslint-disable no-label-var */
/* eslint-disable no-labels */
/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-depth */
/* eslint-disable no-case-declarations */
/* eslint-disable complexity */
import {createScanner} from './scanner';
import {hash} from '../hash/hash';

/**
 * @return{any}
 */
function createElementNode() {
	return {
		attributes: {},
		children: [],
		type: 'ElementNode',
		parent: undefined
	};
}

/**
 * @return {import('../types').CommentNode}
 */
function createCommentNode() {
	return {
		text: '',
		type: 'CommentNode',
		parent: undefined
	};
}

/**
 * @param{string}text
 * @return {import('../types').TextNode}
 */
function createTextNode(text) {
	return {
		type: 'TextNode',
		text,
		parent: undefined
	};
}

function createIdGenerator() {
	let id = 1;
	return () => id++;
}

let d = 0;

/**
 *
 * @param {string} text
 * @param {string[]} selfClosingTags
 */
function parse(
	text,
	{
		selfClosingTags = ['!DOCTYPE', '!doctype', 'input', 'br', 'base', 'link', 'hr', 'img', 'meta'],
		prefixSums = {},
		nextId = createIdGenerator(),
		nodeMap = {},
		newNodeMap = {}
	} = {}
) {
	const scanner = createScanner(text);
	const htmlDocument = createElementNode();
	newNodeMap[0] = htmlDocument;
	/**
	 * special case: whitespace text nodes after <!DOCTYPE html> must be ignored
	 */
	let isAfterDoctype = false;
	let curr: any = htmlDocument;
	let prefixSum = 0;
	let endTagName: string | undefined;
	let pendingAttribute: string | undefined;
	let token = scanner.scan();

	d++;
	let id;
	if (d === 1) {
		prefixSums;
	} else {
		prefixSums;
	}

	const addNode = node => {
		// If (d === 1 && scanner.getTokenOffset() > 250) {
		// 	scanner.getTokenOffset(); // ?
		// 	id;
		// 	node;
		// 	prefixSums;
		// } else if (d === 2 && scanner.getTokenOffset() > 250) {
		// 	node;
		// 	prefixSums;
		// 	scanner.getTokenOffset(); // ?
		// 	id;
		// 	node;
		// }

		// if (scanner.getTokenOffset() > 250 && d === 2) {
		// 	// Console.log(prefixSums);
		// 	scanner.getTokenOffset(); // ?
		// 	scanner.getTokenText(); // ?
		// }

		nextId: if (prefixSums[scanner.getTokenOffset()]) {
			id = prefixSums[scanner.getTokenOffset()];
		} else {
			if (node.type === 'TextNode') {
				// Merge text nodes
				// e.g. <h1>|world</h1>, insert hello, text node will be merged with world text node
				// <h1>|<p>world</p></h1>, insert hello, text node will not be merged with <p>world</p>
				for (
					let i = scanner.getTokenOffset();
					i < scanner.getTokenOffset() + scanner.getTokenText().length;
					i++
				) {
					if (prefixSums[i]) {
						const nextNode = nodeMap[prefixSums[i]]; // ?
						if (nextNode && nextNode.type === 'TextNode') {
							id = parseInt(prefixSums[i], 10);
							delete prefixSums[i];
							prefixSums[scanner.getTokenOffset()] = id;
							break nextId;
						}
					} // ?
				}
			}

			id = nextId();
			// PrefixSums;
			prefixSums[scanner.getTokenOffset()] = id;
			// PrefixSums;
			if (d === 2) {
				id;
				scanner.getTokenText().length; // ?
				scanner.getTokenOffset(); // ?
			}
		}

		if (d === 1) {
			scanner.getTokenOffset(); // ?
			id;
			node;
			prefixSums;
		} else {
			prefixSums;
			scanner.getTokenOffset(); // ?
			id;
			node;
		}

		newNodeMap[id] = node;

		node.id = id;
		node.start = scanner.getTokenOffset() - prefixSum;
		prefixSum = scanner.getTokenOffset();
		node.parent = curr;
		curr.children.push(node);
		curr = node;
	};

	while (token !== 'eos') {
		switch (token) {
			case 'content':
				if (isAfterDoctype && !scanner.getTokenText().trim()) {
					isAfterDoctype = false;
					break;
				}

				addNode(createTextNode(scanner.getTokenText()));
				curr = curr.parent;
				break;
			case 'start-tag-open':
				addNode(createElementNode());
				break;
			case 'start-tag':
				curr.tag = scanner.getTokenText();
				break;
			case 'start-tag-close':
				if (curr.tag && selfClosingTags.includes(curr.tag) && curr.parent) {
					if (curr.tag.toLowerCase() === '!doctype') {
						isAfterDoctype = true;
					}

					curr.closed = true;
					curr = curr.parent;
				}

				break;
			case 'start-tag-self-close':
				if (curr.parent) {
					curr.closed = true;
					curr = curr.parent;
				}

				break;
			case 'end-tag-open':
				endTagName = undefined;
				break;
			case 'end-tag':
				endTagName = scanner.getTokenText().toLowerCase();
				break;
			case 'end-tag-close':
				if (endTagName) {
					let node = curr;
					// See if we can find a matching tag
					while (node.tag !== endTagName && node.parent) {
						node = node.parent;
					}

					if (node.parent) {
						while (curr !== node) {
							curr.closed = false;
							curr = curr.parent;
						}

						curr.closed = true;
						curr = curr.parent;
					}
				}

				break;
			case 'attribute-name': {
				pendingAttribute = scanner.getTokenText();
				let {attributes} = curr;
				if (!attributes) {
					curr.attributes = {};
					attributes = {};
				}

				// @ts-ignore
				attributes[pendingAttribute] = null; // Support valueless attributes such as 'checked'
				break;
			}

			case 'attribute-value': {
				const value = scanner.getTokenText();
				const {attributes} = curr;
				if (attributes && pendingAttribute) {
					attributes[pendingAttribute] = value;
					pendingAttribute = undefined;
				}

				break;
			}

			case 'start-comment-tag':
				addNode(createCommentNode());
				break;
			case 'comment':
				// @ts-ignore
				curr.text = scanner.getTokenText();
				break;
			case 'end-comment-tag':
				// @ts-ignore
				curr = curr.parent;
				break;
			case 'delimiter-assign':
				break;
			default:
				throw new Error('invalid state ' + token);
		}

		token = scanner.scan();
	}

	while (curr.parent) {
		// @ts-ignore
		curr.closed = false;
		// @ts-ignore
		curr = curr.parent;
	}

	return htmlDocument;
}

const i = 0;

/**
 *
 * @param {string} html
 * @param {{nextId:function,nodeMap:object,prefixSums:object}} param1
 */
export const parseHtml = (
	html,
	{nextId = createIdGenerator(), nodeMap = {}, prefixSums = {}, newNodeMap = {}} = {}
) => {
	prefixSums;
	// Let id = 1;

	const result = parse(html, {nextId, nodeMap, prefixSums, newNodeMap});
	const withoutParent = walk(result, dom => {
		delete dom.parent;
		delete dom.closed;
	});
	// Const withId = walk(withoutParent, dom => {
	// 	dom.id = id++;
	// }); // ?
	const withSignature = walk(withoutParent, updateSignature, true);
	return withSignature;
};

// Const result = parse('<h1 class="red"></h1>'); // ?

// // JSON.stringify(result, null, 2);
// const id = 0;
function walk(dom, fn, childrenFirst = false) {
	if (Array.isArray(dom)) {
		return dom.map(d => walk(d, fn, childrenFirst));
	}

	if (!childrenFirst) {
		fn(dom);
	}

	if (dom.children) {
		walk(dom.children, fn, childrenFirst);
	}

	if (childrenFirst) {
		fn(dom);
	}

	return dom;
}

// Const withoutParent = walk(result, dom => {
// 	delete dom.parent;
// 	delete dom.closed;
// });

// JSON.stringify(withoutParent, null, 2); // ?

// const withId = walk(withoutParent, dom => {
// 	dom.id = id++;
// }); // ?

// JSON.stringify(withId[1].children); // ?
/**
 * Updates signatures used to optimize the number of comparisons done during
 * diffing. This is important to call if you change:
 *
 * * children
 * * child node attributes
 * * text content of a text node
 * * child node text
 * @param {{type:'ElementNode', attributeSignature:string,children:import('../types').Node[]}} node
 */
function updateSignature(node) {
	if (node.type === 'ElementNode') {
		node.attributes; // ?
		node.attributeSignature = hash(
			JSON.stringify(node.attributes, (key, value) => (value === undefined ? null : value))
		); // ?

		let subtreeSignature = '';
		let childSignatures = '';
		for (const child of node.children) {
			if (child.type === 'ElementNode') {
				childSignatures += String(child.id);
				subtreeSignature += String(child.id) + child.attributeSignature + child.subtreeSignature;
			} else {
				childSignatures += child.textSignature;
				subtreeSignature += child.textSignature;
			}
		}

		node.childSignature = hash(childSignatures);
		node.subtreeSignature = hash(subtreeSignature);
	} else if (node.type === 'CommentNode' || node.type === 'TextNode') {
		node.textSignature = hash(node.text);
	}
}

export function createParser() {
	let prefixSums: {[key: number]: number} = {};
	let nodeMap = {};
	let nextId = createIdGenerator();
	let dom: any;
	let text: string;
	return {
		parse(domString: string) {
			text = domString;
			prefixSums = {};
			nodeMap = {};
			nextId = createIdGenerator();
			const result = parseHtml(text, {
				prefixSums,
				nextId,
				nodeMap,
				newNodeMap: nodeMap
			});
			walk(result, node => {
				nodeMap[node.id] = node;
			});
			dom = result;
			return result;
		},
		get text() {
			return text;
		},
		get dom() {
			return dom;
		},
		get prefixSums() {
			return prefixSums;
		},
		get nodeMap() {
			return nodeMap;
		},
		edit(
			textWithEdits: string,
			edits: Array<{rangeLength: number; rangeOffset: number; text: string}>
		) {
			text = textWithEdits;
			const edit = edits[0];
			const {rangeOffset, rangeLength, text: editText} = edit;
			for (const rawPrefixSum of Object.keys(prefixSums).reverse()) {
				const prefixSum = parseInt(rawPrefixSum, 10);
				// TODO something is wrong here
				// rangelength > 0 error: enter does not work <h1>a</h1>|\n
				// rangelength = 0 error: replace not working <h1>||a</h1>
				// movement style does not work<h1 | >a</h1> -> <h1 style="background:red">||a</h1>
				if (prefixSum < rangeOffset) {
					// If (parsedPrefixSum <= rangeOffset) {
					// Is before
				} else if (prefixSum === rangeOffset && rangeLength > 0) {
					// Is at edge
				} else if (prefixSum > rangeOffset && prefixSum < rangeOffset + rangeLength) {
					// Is in middle
					// delete nodeMap[prefixSums[prefixSum]]; // TODO
					delete prefixSums[prefixSum];
					continue;
				} else {
					// Is after
					const id = prefixSums[prefixSum];
					delete prefixSums[prefixSum];
					prefixSums[prefixSum + editText.length - rangeLength] = id;
				}
			}

			const newNodeMap = {};
			const result = parseHtml(text, {
				prefixSums,
				nextId,
				nodeMap,
				newNodeMap
			});
			nodeMap = newNodeMap;
			dom = result;
			return result;
		}
	};
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

// @ts-ignore
Object.prototype.pretty = function () {
	return JSON.stringify(
		this.children.map(pretty),
		(k, v) => {
			return v === undefined ? null : v;
		},
		2
	);
};

// const testCase = {
// 	previousDom: '<!DOCTYPE html>',

// 	nextDom: '<h1>a</h1>\n<h1>a</h1>'
// };
// const parser = createParser();
// const parsedH1 = parser.parse(testCase.previousDom);
// const oldNodeMap = parser.nodeMap; // ?
// const parsedH2 = parser.edit(testCase.nextDom, [
// 	{
// 		rangeOffset: 53,
// 		rangeLength: 0,
// 		text: '  '
// 	}
// ]);
// const newNodeMap = parser.nodeMap; // ?
// parsedH1.pretty(); // ?
// parsedH2.pretty(); // ?

parseHtml('<!DOCTYPE html>\n');
