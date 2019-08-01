/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-depth */
/* eslint-disable no-case-declarations */
/* eslint-disable complexity */
// @ts-nocheck
import {createScanner} from './scanner';
import {hash} from '../hash';

/**
 * @return{import('./types').ElementNode}
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
 * @return {import('./types').CommentNode}
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
 * @return {import('./types').TextNode}
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
	id;
	return () => id++;
}

/**
 *
 * @param {string} text
 * @param {string[]} selfClosingTags
 */
function parse(
	text,
	{
		selfClosingTags = [
			'!DOCTYPE',
			'!doctype',
			'input',
			'br',
			'base',
			'link',
			'hr',
			'img',
			'meta'
		],
		prefixSums = [],
		nextId = createIdGenerator(),
		nodeMap = {}
	} = {}
) {
	const scanner = createScanner(text);
	const htmlDocument = createElementNode();
	/**
	 * @type{import('./types').Node}
	 */
	let curr = htmlDocument;
	let prefixSum = 0;
	/**
	 * @type{string|undefined}
	 */
	let endTagName;
	/**
	 * @type{string|undefined}
	 */
	let pendingAttribute;
	let token = scanner.scan();

	const addNode = node => {
		let id;
		if (prefixSums[scanner.getTokenOffset()]) {
			id = prefixSums[scanner.getTokenOffset()];
		} else {
			id = nextId();
			prefixSums[scanner.getTokenOffset()] = id;
			nodeMap[id] = node;
		}

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
				addNode(createTextNode(scanner.getTokenText()));
				curr = curr.parent;
				break;
			case 'start-tag-open':
				addNode(createElementNode(scanner.getTokenText()));
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

				attributes[pendingAttribute] = undefined; // Support valueless attributes such as 'checked'
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
				curr.text = scanner.getTokenText();
				break;
			case 'end-comment-tag':
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
		curr.closed = false;
		curr = curr.parent;
	}

	return htmlDocument.children;
}

const parseHtml = (html, ...args) => {
	// Let id = 1;
	const result = parse(html, ...args);
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
 * @param {{type:'ElementNode', attributeSignature:string,children:import('./types').Node[]}} node
 */
function updateSignature(node) {
	if (node.type === 'ElementNode') {
		node.attributeSignature = hash(
			JSON.stringify(node.attributes, (key, value) =>
				value === undefined ? null : value
			)
		); // ?

		let subtreeSignature = '';
		let childSignatures = '';
		for (const child of node.children) {
			if (child.type === 'ElementNode') {
				childSignatures += String(child.id);
				subtreeSignature +=
					String(child.id) + child.attributeSignature + child.subtreeSignature;
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
	const prefixSums = {};
	let nodeMap = {};
	const nextId = createIdGenerator();
	return {
		parse(text) {
			const result = parseHtml(text, {prefixSums, nextId, nodeMap});
			nodeMap = {};
			walk(result, node => {
				nodeMap[node.id] = node;
			});
			return result;
		},
		get nodeMap() {
			return nodeMap;
		},
		edit(textWithEdits, edits) {
			const edit = edits[0];
			const {insertText} = edit;
			const {offset} = edit;
			for (const prefixSum in prefixSums) {
				if (prefixSum >= offset) {
					const id = prefixSums[prefixSum];
					delete prefixSums[prefixSum];
					prefixSums[parseInt(prefixSum, 10) + insertText.length] = id;
				}
			}

			return parseHtml(textWithEdits, {
				prefixSums,
				nextId,
				nodeMap
			});
		}
	};
}

const pretty = node => {
	if (node.type === 'ElementNode') {
		return {
			tag: node.tag,
			children: node.children.map(pretty),
			id: node.id
		};
	}

	return {
		type: node.type,
		text: node.text,
		id: node.id
	};
};

Array.prototype.pretty = function () {
	return JSON.stringify(this.map(pretty), null, 2);
};

const testCase = {
	previousDom: '<h1><p>ok</p></h1>',
	nextDom: '<h1>hello<p>ok</p></h1>'
};

const parser = createParser();
// Parser.parse(testCase.previousDom).pretty(); // ?
// parser.nodeMap; // ?
// parser.edit(testCase.nextDom, [{offset: 4, insertText: 'hello'}]).pretty(); // ?

// parser.nodeMap; // ?

const parsedH1 = parser.parse(testCase.previousDom);
const parsedH2 = parser.edit(testCase.nextDom, [
	{offset: 4, insertText: 'hello'}
]);
parsedH2;
const nodeMap2 = parser.nodeMap;
parsedH1.pretty(); // ?
parsedH2.pretty(); // ?
// JSON.stringify(result, null, 2); // ?

// JSON.stringify(walk(withId, updateSignature), null, 2); // ?

// JSON.stringify(parseHTML('<h1><p>hello</p><p>world</p></h1>'), null, 2); // ?
// ParseHTML(`<head>
// <meta charset="utf-8" />
// </head>

// <body>
// <h1>hello wsssssdddddd</h1>
// <h1>hello wsssssdddddd</h1>
// <h1>hello wsssssddddddd</h1>
// <h1>hello wsssssdddddd</h1>
// <h1>hello w </h1>
// <h1>hello wsssssdddddd</h1>
// <!-- <button>hello</button> -->
// </body>`); // ?
