import {build} from '../../../src/HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {isElement} from '../../../src/HTMLSimpleDom/HTMLSimpleDOM';

export function genDom(orig) {
	let gen = '';
	let lastIndex = 0;
	// @ts-ignore
	const {dom} = build(orig);

	dom;
	// Walk through the dom nodes and insert the 'data-brackets-id' attribute at the
	// end of the open tag
	function walk(node) {
		if (node.tag) {
			const attrText = ' data-brackets-id=\'' + node.tagId + '\'';

			// Insert the attribute as the first attribute in the tag.
			const insertIndex = node.start + node.tag.length + 1;
			gen += orig.substr(lastIndex, insertIndex - lastIndex) + attrText;
			lastIndex = insertIndex;
		}

		if (isElement(node)) {
			node.children.forEach(walk);
		}
	}

	walk(dom);
	gen += orig.substr(lastIndex);

	return gen;
}

// GenDom('<h1>hello world</h1>'); // ?

genDom(`<h1>dkkkkkkkkkdkdddddd</h1>
<div>de</div>
<p></p>
`); // ?
