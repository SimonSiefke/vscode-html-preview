({
	ignoreExternalFileChanges: true
});
const HtmlSimpleDom = require('./HTMLSimpleDOM');
/**
 * @private
 *
 * Generates a string version of a SimpleDOM for debugging purposes.
 *
 * @param {SimpleNode} root root of the tree
 * @return {string} Text version of the tree.
 */
function dumpDOM(root) {
	let result = '';
	let indent = '';

	function walk(node) {
		if (node.tag) {
			result +=
				indent +
				'TAG ' +
				node.tagID +
				' ' +
				node.tag +
				' ' +
				JSON.stringify(node.attributes) +
				'\n';
		} else {
			result += indent + 'TEXT ' + (node.tagID || '- ') + node.content + '\n';
		}

		if (node.isElement()) {
			indent += '  ';
			node.children.forEach(walk);
			indent = indent.slice(2);
		}
	}

	walk(root);

	return result;
}

function _build(text, startOffset, startOffsetPos, strict, expectedErrors) {
	const builder = new HtmlSimpleDom.Builder(text);
	const root = builder.build(strict);
	const {errors} = builder;

	// If (expectedErrors) {
	// 	expect(root).toBeNull();
	// } else {
	// 	expect(root).toBeTruthy();
	// }

	// Expect(errors).toEqual(expectedErrors);

	return root;
}

function build(text, strict, expectedErrors) {
	return _build(text, undefined, undefined, strict, expectedErrors);
}

const text = '<div><p>unclosed para<h1>heading that closes para</h1></div>';

const result = build(text, true); // ?
