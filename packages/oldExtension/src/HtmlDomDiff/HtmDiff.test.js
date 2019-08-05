import {build} from '../HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {domdiff} from './HTMLDOMDiff';

/** @typedef {import('./HtmlDiff.types').TestCase} TestCase */

/**
 * Runs a list of test cases.
 * @param {TestCase[]} testCases - the test cases to run
 */
function run(testCases) {
	for (const testCase of testCases) {
		const previousDom = build(testCase.previousDom).dom;
		const nextDom = build(testCase.nextDom).dom;
		const diffs = domdiff(previousDom, nextDom);
		expect(diffs).toEqual(testCase.expectedEdits);
	}
}

test('no diff', () => {
	/**
	 * @type {TestCase[]}
	 */
	const testCases = [{
		previousDom: '<h1>hello world</h1>',
		nextDom: '<h1>hello world</h1>',
		expectedEdits: []
	}];
	run(testCases);
});

it('should handle attribute change', () => {
	/**
	 * @type{TestCase[]}
	 */
	const testCases = [{
		previousDom: '<meta name="description" content="An interactive getting started guide for Brackets.">',
		nextDom: '<meta name="description" content="An interactive, awesome getting started guide for Brackets.">',
		expectedEdits: [{
			type: 'attrChange',
			tagId: 1,
			attribute: 'content',
			value: 'An interactive, awesome getting started guide for Brackets.'
		}]
	}];
	run(testCases);
});

it('new attributes', () => {
	/**
	 * @type {TestCase[]}
	 */
	const testCases = [{
		previousDom: '<h1>GETTING STARTED WITH BRACKETS</h1>',
		nextDom: '<h1 class=\'supertitle\'>GETTING STARTED WITH BRACKETS</h1>',
		expectedEdits: [
			{
				type: 'attrAdd',
				tagId: 1,
				attribute: 'class',
				value: 'supertitle'
			}
		]
	}];
	run(testCases);
});

test('deleted attributes', () => {
	/**
	 * @type {TestCase[]}
	 */
	const testCases = [{
		previousDom: '<meta name="description" content="An interactive getting started guide for Brackets.">',
		nextDom: '<meta name="description">',
		expectedEdits: [{
			type: 'attrDelete',
			tagId: 1,
			attribute: 'content'
		}]
	}];
	run(testCases);
});

test('simple altered text', () => {
	/**
	 * @type {TestCase[]}
	 */
	const testCases = [{
		previousDom: '<h1>GETTING STARTED WITH BRACKETS</h1>',
		nextDom: '<h1>GETTING AWESOMER WITH BRACKETS</h1>',
		expectedEdits: [{
			type: 'textReplace',
			parentId: 1,
			content: 'GETTING AWESOMER WITH BRACKETS'
		}]
	}];
	run(testCases);
});

// eslint-disable-next-line
test.skip('two incremental text edits in a row', () => {
	// // Short-circuit this test if we're running without incremental updates
	// if (!HTMLInstrumentation._allowIncremental) {
	// 		return;
	// }

	// setupEditor(WellFormedDoc);
	// runs(function () {
	// 		var previousDOM = HTMLSimpleDOM.build(editor.document.getText()),
	// 				tagID = previousDOM.children[3].children[1].tagID,
	// 				result,
	// 				origParent = previousDOM.children[3];
	// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

	// 		editor.document.replaceRange("AWESOMER", {line: 12, ch: 12}, {line: 12, ch: 19});

	// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

	// 		// TODO: how to test that only an appropriate subtree was reparsed/diffed?
	// 		expect(result.edits.length).toEqual(1);
	// 		expect(result.dom.children[3].children[1].tag).toEqual("h1");
	// 		expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
	// 		expect(result.edits[0]).toEqual({
	// 				type: "textReplace",
	// 				parentID: tagID,
	// 				content: "GETTING AWESOMER WITH BRACKETS"
	// 		});
	// 		// this should have been an incremental edit since it was just typing
	// 		expect(result._wasIncremental).toBe(true);
	// 		// make sure the parent of the change is still the same node as in the old tree
	// 		expect(result.dom.nodeMap[tagID].parent).toBe(origParent);

	// 		editor.document.replaceRange("MOAR AWESOME", {line: 12, ch: 12}, {line: 12, ch: 20});

	// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

	// 		// TODO: how to test that only an appropriate subtree was reparsed/diffed?
	// 		expect(result.edits.length).toEqual(1);
	// 		expect(result.dom.children[3].children[1].tag).toEqual("h1");
	// 		expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
	// 		expect(result.edits[0]).toEqual({
	// 				type: "textReplace",
	// 				parentID: tagID,
	// 				content: "GETTING MOAR AWESOME WITH BRACKETS"
	// 		});

	// 		// this should have been an incremental edit since it was just typing
	// 		expect(result._wasIncremental).toBe(true);
	// 		// make sure the parent of the change is still the same node as in the old tree
	// 		expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
	// });
});

// eslint-disable-next-line
test.skip('avoid updating while typing an incomplete tag, then update when it\'s done', () => {
	/**
	 * @type{TestCase[]}
	 */
	const testCases = [{
		previousDom: '<h1>GETTING STARTED WITH BRACKETS</h1>',
		nextDom: '<h1>GETTING STARTED WITH BRACKETS</h1><p',
		expectedEdits: []
	}];
	run(testCases);
	// SetupEditor(WellFormedDoc);
	// runs(function () {
	// 		var previousDOM = HTMLSimpleDOM.build(editor.document.getText()),
	// 				result;

	// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

	// 		// While the tag is incomplete, we should get no edits.
	// 		result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, "<p");
	// 		expect(result.finalInvalid).toBe(true);

	// 		// This simulates our autocomplete behavior. The next case simulates the non-autocomplete case.
	// 		editor.document.replaceRange("></p>", {line: 12, ch: 40});

	// 		// We don't pass the changeList here, to simulate doing a full rebuild (which is
	// 		// what the normal incremental update logic would do after invalid edits).
	// 		// TODO: a little weird that we're not going through the normal update logic
	// 		// (in getUnappliedEditList, etc.)
	// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor);

	// 		// This should really only have one edit (the tag insertion), but it also
	// 		// deletes and recreates the whitespace after it, similar to other insert cases.
	// 		var newElement = result.dom.children[3].children[2],
	// 				parentID = newElement.parent.tagID,
	// 				afterID = result.dom.children[3].children[1].tagID,
	// 				beforeID = result.dom.children[3].children[4].tagID;
	// 		expect(result.edits.length).toEqual(3);
	// 		expect(newElement.tag).toEqual("p");
	// 		expect(result.edits[0]).toEqual({
	// 				type: "textDelete",
	// 				parentID: parentID,
	// 				afterID: afterID,
	// 				beforeID: beforeID
	// 		});
	// 		expect(result.edits[1]).toEqual({
	// 				type: "elementInsert",
	// 				tag: "p",
	// 				tagID: newElement.tagID,
	// 				attributes: {},
	// 				parentID: parentID,
	// 				beforeID: beforeID // TODO: why is there no afterID here?
	// 		});
	// 		expect(result.edits[2]).toEqual({
	// 				type: "textInsert",
	// 				content: "\n",
	// 				parentID: parentID,
	// 				afterID: newElement.tagID,
	// 				beforeID: beforeID
	// 		});
	// });
});

// eslint-disable-next-line
test.skip('typing of a <p> without a </p> and then adding it later', () => {
	/**
	 * @type {TestCase[]}
	 */
	const testCases = [{
		previousDom: '<h1>GETTING STARTED WITH BRACKETS</h1><p',
		nextDom: '<h1>GETTING STARTED WITH BRACKETS</h1><p>',
		expectedEdits: [{
			type: 'textDelete',
			parentId: 1,
			afterId: 1,
			beforeI: 1
		},
		{
			type: 'elementInsert',
			tag: 'p',
			tagId: 2,
			attributes: {},
			parentId: 1,
			beforeId: 1
		},
		{
			type: 'textInsert',
			content: '\n',
			parentId: 1,
			lastChild: true
		}]
	}];
	run(testCases);
	// SetupEditor(WellFormedDoc);
	// runs(() => {
	// 	let previousDOM = HTMLSimpleDOM.build(editor.document.getText());
	// 	let result;

	// 	HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

	// 	// No edits should occur while we're invalid.
	// 	result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, '<p');
	// 	expect(result.finalInvalid).toBe(true);

	// 	// This simulates what would happen if autocomplete were off. We're actually
	// 	// valid at this point since <p> is implied close. We want to make sure that
	// 	// basically nothing happens if the user types </p> after this.
	// 	editor.document.replaceRange('>', {line: 12, ch: 40});

	// 	// We don't pass the changeList here, to simulate doing a full rebuild (which is
	// 	// what the normal incremental update logic would do after invalid edits).
	// 	// TODO: a little weird that we're not going through the normal update logic
	// 	// (in getUnappliedEditList, etc.)
	// 	result = HTMLInstrumentation._updateDOM(previousDOM, editor);

	// 	// Since the <p> is unclosed, we think the whitespace after it is inside it.
	// 	let newElement = result.dom.children[3].children[2];
	// 	const parentID = newElement.parent.tagID;
	// 	const afterID = result.dom.children[3].children[1].tagID;
	// 	let beforeID = result.dom.children[3].children[3].tagID;
	// 	expect(result.edits).toHaveLength(3);
	// 	expect(newElement.tag).toEqual('p');
	// 	expect(newElement.children).toHaveLength(1);
	// 	expect(newElement.children[0].content).toEqual('\n');
	// 	expect(result.edits[0]).toEqual({
	// 		type: 'textDelete',
	// 		parentID,
	// 		afterID,
	// 		beforeID
	// 	});
	// 	expect(result.edits[1]).toEqual({
	// 		type: 'elementInsert',
	// 		tag: 'p',
	// 		tagID: newElement.tagID,
	// 		attributes: {},
	// 		parentID,
	// 		beforeID // No afterID because beforeID is preferred given the insertBefore DOM API
	// 	});
	// 	expect(result.edits[2]).toEqual({
	// 		type: 'textInsert',
	// 		content: '\n',
	// 		parentID: newElement.tagID,
	// 		lastChild: true
	// 	});

	// 	// We should get no edits while typing the close tag.
	// 	previousDOM = result.dom;
	// 	result = typeAndExpect(editor, previousDOM, {line: 12, ch: 41}, '</p');
	// 	expect(result.finalInvalid).toBe(true);

	// 	// When we type the ">" at the end, we should get a delete of the text inside the <p>
	// 	// and an insert of text after the </p> since we now know that the close is before the
	// 	// text.
	// 	editor.document.replaceRange('>', {line: 12, ch: 44});
	// 	result = HTMLInstrumentation._updateDOM(previousDOM, editor);

	// 	newElement = result.dom.children[3].children[2];
	// 	beforeID = result.dom.children[3].children[4].tagID;
	// 	expect(newElement.children).toHaveLength(0);
	// 	expect(result.dom.children[3].children[3].content).toEqual('\n');
	// 	expect(result.edits).toHaveLength(2);
	// 	expect(result.edits[0]).toEqual({
	// 		type: 'textInsert',
	// 		content: '\n',
	// 		parentID: newElement.parent.tagID,
	// 		afterID: newElement.tagID,
	// 		beforeID
	// 	});
	// 	expect(result.edits[1]).toEqual({
	// 		type: 'textDelete',
	// 		parentID: newElement.tagID
	// 	});
	// });
});
