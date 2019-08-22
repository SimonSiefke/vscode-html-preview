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
		children: [] as any,
		nodeType: 'ElementNode',
		parent: undefined
	};
}

/**
 * @return {import('../types').CommentNode}
 */
function createCommentNode() {
	return {
		text: '',
		nodeType: 'CommentNode',
		parent: undefined
	};
}

/**
 * @param{string}text
 * @return {import('../types').TextNode}
 */
function createTextNode(text) {
	return {
		nodeType: 'TextNode',
		text,
		parent: undefined
	};
}

function createIdGenerator() {
	let id = 1;
	return () => id++;
}

type ParsingError = {
	type: 'invalid' | 'soft-invalid'
	message: string
	offset: number
};

type ParsingResult = {
	htmlDocument?: HtmlDocument
	error?: ParsingError | null // TODO not null but undefined instead
};

export interface HtmlDocument {
	children: any[]
}

export interface Parser {
	readonly parse: (domString: string) => ParsingResult
	readonly text: string
	readonly dom: any

	readonly prefixSums: any
	readonly nodeMap: any
	edit: (
		textWithEdits: string,
		edits: Array<{rangeLength: number; rangeOffset: number; text: string}>
	) => ParsingResult
}

/**
 *
 */
function parse(
	text: string,
	{
		selfClosingTags = ['!DOCTYPE', '!doctype', 'input', 'br', 'base', 'link', 'hr', 'img', 'meta'],
		prefixSums = {},
		nextId = createIdGenerator(),
		nodeMap = {},
		newNodeMap = {}
	} = {}
): ParsingResult {
	const scanner = createScanner(text);
	const htmlDocument = createElementNode();
	newNodeMap[0] = htmlDocument;

	let curr: any = htmlDocument;
	let prefixSum = 0;
	let endTagName: string | undefined;
	let pendingAttribute: string | undefined;
	let token = scanner.scan();
	let error: {type: 'soft-invalid' | 'invalid'; message: string; offset: number} | null = null;

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

		let id: number;

		nextId: if (prefixSums[scanner.getTokenOffset()]) {
			id = prefixSums[scanner.getTokenOffset()];
			const previousNode = nodeMap[id];
			// when there was a different element, use a new id
			// if (
			// 	previousNode.nodeType === 'ElementNode' &&
			// 	node.nodeType === 'ElementNode' &&
			// 	previousNode.tag !== node.tag
			// ) {
			// 	console.log('not same tag', previousNode.tag, node.tag);
			// 	id = nextId();
			// }
		} else {
			if (node.nodeType === 'TextNode') {
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
						if (nextNode && nextNode.nodeType === 'TextNode') {
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
			case 'error':
				return {
					error: scanner.getError()
				};
			case 'content':
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
					if (curr.tag !== endTagName) {
						return {
							error: {
								type: 'invalid',
								message: `wrong end tag (expected ${curr.tag}, got ${endTagName})`,
								offset: scanner.getTokenOffset()
							}
						};
					}

					curr.closed = true;
					curr = curr.parent;
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

	if (scanner.state !== 'within-content') {
		error = {
			type: 'invalid',
			message: 'invalid end tag',
			offset: scanner.getTokenOffset()
		};
		return {error};
	}

	while (curr.parent) {
		if (!error) {
			error = {
				type: 'soft-invalid',
				message: 'missing closing tag',
				offset: scanner.getTokenOffset()
			};
		}

		// @ts-ignore
		curr.closed = false;
		// @ts-ignore
		curr = curr.parent;
	}

	return {htmlDocument, error};
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

	const {htmlDocument, error} = parse(html, {nextId, nodeMap, prefixSums, newNodeMap});
	if (error && error.type === 'invalid') {
		return {error};
	}

	const withoutParent = walk(htmlDocument, dom => {
		delete dom.parent;
		delete dom.closed;
	});
	// return {htmlDocument: withoutParent, error};
	// Const withId = walk(withoutParent, dom => {
	// 	dom.id = id++;
	// }); // ?
	const withSignature = walk(withoutParent, updateSignature, true);
	return {htmlDocument: withSignature, error};
};

// Const result = parse('<h1 class="big"></h1>'); // ?

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
	if (node.nodeType === 'ElementNode') {
		node.attributes; // ?
		node.attributeSignature = hash(
			JSON.stringify(node.attributes, (key, value) => (value === undefined ? null : value))
		); // ?

		let subtreeSignature = '';
		let childSignatures = '';
		for (const child of node.children) {
			if (child.nodeType === 'ElementNode') {
				childSignatures += String(child.id);
				subtreeSignature +=
					String(child.id) + child.attributeSignature + child.subtreeSignature + child.tag;
			} else {
				childSignatures += child.textSignature;
				subtreeSignature += child.textSignature;
			}
		}

		node.childSignature = hash(childSignatures);
		node.subtreeSignature = hash(subtreeSignature);
	} else if (node.nodeType === 'CommentNode' || node.nodeType === 'TextNode') {
		node.textSignature = hash(node.text);
	}
}

export function createParser(): Parser {
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
			dom = result.htmlDocument;
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
				// movement style does not work<h1 | >a</h1> -> <h1 style="font-size:10px">||a</h1>
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
			const {htmlDocument, error} = parseHtml(text, {
				prefixSums,
				nextId,
				nodeMap,
				newNodeMap
			});
			if (error) {
				return {error};
			}

			nodeMap = newNodeMap;
			dom = htmlDocument;
			return {htmlDocument};
		}
	};
}

const pretty = node => {
	if (node.nodeType === 'ElementNode') {
		return {
			tag: node.tag,
			children: node.children.map(pretty),
			id: node.id,
			attributes: node.attributes
		};
	}

	return {
		nodeType: node.nodeType,
		text: node.text,
		id: node.id
	};
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

const testCase = {
	previousDom: '<p class=>some text</p>'
};
const parser = createParser();
const parsedH1 = parser.parse(testCase.previousDom);

parsedH1 && parsedH1.htmlDocument && parsedH1.htmlDocument.children; // ?

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

// parseHtml(`<!doctype html>

// `); // ?
