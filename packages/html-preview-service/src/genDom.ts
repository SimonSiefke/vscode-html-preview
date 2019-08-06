import {parseHtml} from 'virtual-dom';

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

		if (node.type === 'ElementNode') {
			node.children.forEach(walk);
		}
	}

	dom.forEach(walk);
	gen += orig.substr(lastIndex);

	return gen;
}
