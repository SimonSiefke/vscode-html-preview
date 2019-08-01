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
	let prefixSum = 0;
	function walk(node) {
		prefixSum += node.start;
		if (node.type === 'ElementNode') {
			const attrText = ` data-id="${node.id}"`;
			lastIndex;
			prefixSum;

			// Insert the attribute as the first attribute in the tag.
			const insertIndex = prefixSum + node.tag.length + 1;
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

// GenDom(`<html>

// <h1>
//   <p>ok</p>
// </h1>

// </html>`); // ?

// GenDom('<h1 class="">hello world</h1>'); // ?
// genDom(`<head>
// <meta charset="utf-8" />
// </head>

// <body>
// <p>ok</p>
// <p>ok</p>
// <p>ok</p>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo gwdsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wsssssdddddd</h1>
// <h1>helldo wwwssdssssddddddp</h1>
// </body>`); // ?
// ParseHTML('<h1 class="">hello world</h1>'); // ?

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
