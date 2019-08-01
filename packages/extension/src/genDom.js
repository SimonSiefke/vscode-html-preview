/* eslint-disable valid-jsdoc */
import {build} from '../../../src/HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {isElement} from '../../../src/HTMLSimpleDom/HTMLSimpleDOM';
import {parseHtml} from '../../../src/VirtualDom/parse';

export function genDom(orig) {
	let gen = '';
	let lastIndex = 0;
	// @ts-ignore
	const dom = parseHtml(orig); // ?

	// Walk through the dom nodes and insert the 'data-brackets-id' attribute at the
	// end of the open tag
	function walk(node) {
		node.type; // ?
		if (node.type === 'ElementNode') {
			const attrText = ` data-id="${node.id}"`;

			// Insert the attribute as the first attribute in the tag.
			const insertIndex = node.start + node.tag.length + 1;
			gen += orig.substr(lastIndex, insertIndex - lastIndex) + attrText;
			lastIndex = insertIndex;
		}

		if (isElement(node)) {
			node.children.forEach(walk);
		}
	}

	dom.forEach(walk);
	gen += orig.substr(lastIndex);

	return gen;
}

genDom('<h1 class="">hello world</h1>'); // ?
// parseHTML('<h1 class="">hello world</h1>'); // ?

// genDom(`<h1>dkkkkkkkkkdkdddddd</h1>
// <div>de</div>
// <p></p>
// `); // ?

// const dom = build('<h1>hello <strong>world</strong></h1>'); // ?

/**
 *
 * @param {any} dom
 */
// function walk(dom) {
// 	if (dom.tag) {
// 		/**
// 		 * @type {import('../../client/src/types').ElementNode}
// 		 */
// 		const elementNode = {
// 			type: 'ElementNode',
// 			tag: dom.tag,
// 			children: dom.children.map(child => walk(child)),
// 			attributes: {}
// 		};
// 		return elementNode;
// 	}

// 	/**
// 	 * @type {import('../../client/src/types').TextNode}
// 	 */
// 	const textNode = {
// 		type: 'TextNode',
// 		text: dom.content
// 	};
// 	return textNode;
// }

// Walk(dom.dom); // ?
