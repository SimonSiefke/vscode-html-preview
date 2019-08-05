const parserTestCases = require('./fixtures/parserTestCases.json');
import {parse} from './parse';

function withDefaults(expectedNode) {
	if (expectedNode.type === 'ElementNode') {
		expectedNode.attributes = expectedNode.attributes || {};
		expectedNode.children = expectedNode.children || [];
		for (const attribute in expectedNode.attributes) {
			if (expectedNode.attributes[attribute] === null) {
				expectedNode.attributes[attribute] = undefined;
			}
		}

		expectedNode.children = expectedNode.children.map(withDefaults);
	}

	return expectedNode;
}

function adjust(actualNode) {
	delete actualNode.parent;
	delete actualNode.start
	delete actualNode.id
	if (actualNode.children) {
		actualNode.children = actualNode.children.map(adjust);
	}

	delete actualNode.closed;

	return actualNode;
}

test.each(parserTestCases.map(({input, expected}) => [input, expected]))('%s', (input, expectedNodes) => {
	const actualNodes = parse(input);
	for (let i = 0; i < expectedNodes.length; i++) {
		const actualNode = adjust(actualNodes[i]);
		const expectedNode = withDefaults(expectedNodes[i]);
		expect(actualNode).toEqual(expectedNode);
	}
});
