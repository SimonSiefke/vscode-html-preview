/* eslint-disable no-negated-condition */
/* eslint-disable max-nested-callbacks */
/* Unittests: HTML Instrumentation */
// @ts-nocheck
/* global describe, it, expect */

// Load dependent modules
import {build} from '../HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {domdiff} from '../HtmlDomDiff/HTMLDOMDiff';

describe('HTML Instrumentation', () => {
	describe('HTML Instrumentation in dirty files', () => {
		it('should handle no diff', () => {
			const previousDOM = build('<h1>hello world</h1>').dom;
			const nextDom = build('<h1>hello world</h1>').dom;
			const result = domdiff(previousDOM, nextDom);
			expect(result).toEqual([]);
			// Expect(result.dom).toEqual(previousDOM);
		});

		// It('should handle attribute change', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let tagID;
		// 		let origParent;
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(', awesome', {line: 7, ch: 56});
		// 				tagID = previousDOM.children[1].children[7].tagID;
		// 				origParent = previousDOM.children[1];
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(result.edits.length).toEqual(1);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'attrChange',
		// 					tagID,
		// 					attribute: 'content',
		// 					value:
		// 						'An interactive, awesome getting started guide for Brackets.'
		// 				});

		// 				if (incremental) {
		// 					// This should have been a true incremental edit
		// 					expect(result._wasIncremental).toBe(true);
		// 					// Make sure the parent of the change is still the same node as in the old tree
		// 					expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
		// 				} else {
		// 					// Entire tree should be different
		// 					expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle new attributes', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let tagID;
		// 		let origParent;
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(' class=\'supertitle\'', {
		// 					line: 12,
		// 					ch: 3
		// 				});
		// 				tagID = previousDOM.children[3].children[1].tagID;
		// 				origParent = previousDOM.children[3];
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(result.edits.length).toEqual(1);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'attrAdd',
		// 					tagID,
		// 					attribute: 'class',
		// 					value: 'supertitle'
		// 				});

		// 				if (incremental) {
		// 					// This should not have been a true incremental edit since it changed the attribute structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}

		// 				// Entire tree should be different
		// 				expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle deleted attributes', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let tagID;
		// 		let origParent;
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'',
		// 					{line: 7, ch: 32},
		// 					{line: 7, ch: 93}
		// 				);
		// 				tagID = previousDOM.children[1].children[7].tagID;
		// 				origParent = previousDOM.children[1];
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(result.edits.length).toEqual(1);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'attrDelete',
		// 					tagID,
		// 					attribute: 'content'
		// 				});

		// 				if (incremental) {
		// 					// This should not have been a true incremental edit since it changed the attribute structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}

		// 				// Entire tree should be different
		// 				expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle simple altered text', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let tagID;
		// 		let origParent;
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'AWESOMER',
		// 					{line: 12, ch: 12},
		// 					{line: 12, ch: 19}
		// 				);
		// 				tagID = previousDOM.children[3].children[1].tagID;
		// 				origParent = previousDOM.children[3];
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(result.edits.length).toEqual(1);
		// 				expect(previousDOM.children[3].children[1].tag).toEqual('h1');

		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textReplace',
		// 					parentID: tagID,
		// 					content: 'GETTING AWESOMER WITH BRACKETS'
		// 				});

		// 				if (incremental) {
		// 					// This should have been an incremental edit since it was just typing
		// 					expect(result._wasIncremental).toBe(true);
		// 					// Make sure the parent of the change is still the same node as in the old tree
		// 					expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
		// 				} else {
		// 					// Entire tree should be different
		// 					expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle two incremental text edits in a row', () => {
		// 	// Short-circuit this test if we're running without incremental updates
		// 	if (!HTMLInstrumentation._allowIncremental) {
		// 		return;
		// 	}

		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const {tagID} = previousDOM.children[3].children[1];
		// 		let result;
		// 		const origParent = previousDOM.children[3];
		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		editor.document.replaceRange(
		// 			'AWESOMER',
		// 			{line: 12, ch: 12},
		// 			{line: 12, ch: 19}
		// 		);

		// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

		// 		// TODO: how to test that only an appropriate subtree was reparsed/diffed?
		// 		expect(result.edits.length).toEqual(1);
		// 		expect(result.dom.children[3].children[1].tag).toEqual('h1');
		// 		expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
		// 		expect(result.edits[0]).toEqual({
		// 			type: 'textReplace',
		// 			parentID: tagID,
		// 			content: 'GETTING AWESOMER WITH BRACKETS'
		// 		});
		// 		// This should have been an incremental edit since it was just typing
		// 		expect(result._wasIncremental).toBe(true);
		// 		// Make sure the parent of the change is still the same node as in the old tree
		// 		expect(result.dom.nodeMap[tagID].parent).toBe(origParent);

		// 		editor.document.replaceRange(
		// 			'MOAR AWESOME',
		// 			{line: 12, ch: 12},
		// 			{line: 12, ch: 20}
		// 		);

		// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

		// 		// TODO: how to test that only an appropriate subtree was reparsed/diffed?
		// 		expect(result.edits.length).toEqual(1);
		// 		expect(result.dom.children[3].children[1].tag).toEqual('h1');
		// 		expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
		// 		expect(result.edits[0]).toEqual({
		// 			type: 'textReplace',
		// 			parentID: tagID,
		// 			content: 'GETTING MOAR AWESOME WITH BRACKETS'
		// 		});

		// 		// This should have been an incremental edit since it was just typing
		// 		expect(result._wasIncremental).toBe(true);
		// 		// Make sure the parent of the change is still the same node as in the old tree
		// 		expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
		// 	});
		// });

		// it('should avoid updating while typing an incomplete tag, then update when it\'s done', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// While the tag is incomplete, we should get no edits.
		// 		result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, '<p');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// This simulates our autocomplete behavior. The next case simulates the non-autocomplete case.
		// 		editor.document.replaceRange('></p>', {line: 12, ch: 40});

		// 		// We don't pass the changeList here, to simulate doing a full rebuild (which is
		// 		// what the normal incremental update logic would do after invalid edits).
		// 		// TODO: a little weird that we're not going through the normal update logic
		// 		// (in getUnappliedEditList, etc.)
		// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor);

		// 		// This should really only have one edit (the tag insertion), but it also
		// 		// deletes and recreates the whitespace after it, similar to other insert cases.
		// 		const newElement = result.dom.children[3].children[2];
		// 		const parentID = newElement.parent.tagID;
		// 		const afterID = result.dom.children[3].children[1].tagID;
		// 		const beforeID = result.dom.children[3].children[4].tagID;
		// 		expect(result.edits.length).toEqual(3);
		// 		expect(newElement.tag).toEqual('p');
		// 		expect(result.edits[0]).toEqual({
		// 			type: 'textDelete',
		// 			parentID,
		// 			afterID,
		// 			beforeID
		// 		});
		// 		expect(result.edits[1]).toEqual({
		// 			type: 'elementInsert',
		// 			tag: 'p',
		// 			tagID: newElement.tagID,
		// 			attributes: {},
		// 			parentID,
		// 			beforeID // TODO: why is there no afterID here?
		// 		});
		// 		expect(result.edits[2]).toEqual({
		// 			type: 'textInsert',
		// 			content: '\n',
		// 			parentID,
		// 			afterID: newElement.tagID,
		// 			beforeID
		// 		});
		// 	});
		// });

		// it('should handle typing of a <p> without a </p> and then adding it later', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// No edits should occur while we're invalid.
		// 		result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, '<p');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// This simulates what would happen if autocomplete were off. We're actually
		// 		// valid at this point since <p> is implied close. We want to make sure that
		// 		// basically nothing happens if the user types </p> after this.
		// 		editor.document.replaceRange('>', {line: 12, ch: 40});

		// 		// We don't pass the changeList here, to simulate doing a full rebuild (which is
		// 		// what the normal incremental update logic would do after invalid edits).
		// 		// TODO: a little weird that we're not going through the normal update logic
		// 		// (in getUnappliedEditList, etc.)
		// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor);

		// 		// Since the <p> is unclosed, we think the whitespace after it is inside it.
		// 		let newElement = result.dom.children[3].children[2];
		// 		const parentID = newElement.parent.tagID;
		// 		const afterID = result.dom.children[3].children[1].tagID;
		// 		let beforeID = result.dom.children[3].children[3].tagID;
		// 		expect(result.edits.length).toEqual(3);
		// 		expect(newElement.tag).toEqual('p');
		// 		expect(newElement.children.length).toEqual(1);
		// 		expect(newElement.children[0].content).toEqual('\n');
		// 		expect(result.edits[0]).toEqual({
		// 			type: 'textDelete',
		// 			parentID,
		// 			afterID,
		// 			beforeID
		// 		});
		// 		expect(result.edits[1]).toEqual({
		// 			type: 'elementInsert',
		// 			tag: 'p',
		// 			tagID: newElement.tagID,
		// 			attributes: {},
		// 			parentID,
		// 			beforeID // No afterID because beforeID is preferred given the insertBefore DOM API
		// 		});
		// 		expect(result.edits[2]).toEqual({
		// 			type: 'textInsert',
		// 			content: '\n',
		// 			parentID: newElement.tagID,
		// 			lastChild: true
		// 		});

		// 		// We should get no edits while typing the close tag.
		// 		previousDOM = result.dom;
		// 		result = typeAndExpect(editor, previousDOM, {line: 12, ch: 41}, '</p');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// When we type the ">" at the end, we should get a delete of the text inside the <p>
		// 		// and an insert of text after the </p> since we now know that the close is before the
		// 		// text.
		// 		editor.document.replaceRange('>', {line: 12, ch: 44});
		// 		result = HTMLInstrumentation._updateDOM(previousDOM, editor);

		// 		newElement = result.dom.children[3].children[2];
		// 		beforeID = result.dom.children[3].children[4].tagID;
		// 		expect(newElement.children.length).toEqual(0);
		// 		expect(result.dom.children[3].children[3].content).toEqual('\n');
		// 		expect(result.edits.length).toEqual(2);
		// 		expect(result.edits[0]).toEqual({
		// 			type: 'textInsert',
		// 			content: '\n',
		// 			parentID: newElement.parent.tagID,
		// 			afterID: newElement.tagID,
		// 			beforeID
		// 		});
		// 		expect(result.edits[1]).toEqual({
		// 			type: 'textDelete',
		// 			parentID: newElement.tagID
		// 		});
		// 	});
		// });

		// it('should handle deleting of an empty tag character-by-character', () => {
		// 	setupEditor('<p><img>{{0}}</p>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const imgTagID = previousDOM.children[0].tagID;
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// First four deletions should keep it in an invalid state.
		// 		result = deleteAndExpect(editor, previousDOM, offsets[0], 4);
		// 		expect(result.finalInvalid).toBe(true);

		// 		// We're exiting an invalid state, so we pass "true" for the final argument
		// 		// here, which forces a full reparse (the same as getUnappliedEdits() does).
		// 		deleteAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			1,
		// 			[[{type: 'elementDelete', tagID: imgTagID}]],
		// 			true
		// 		);
		// 	});
		// });

		// it('should handle deleting of a non-empty tag character-by-character', () => {
		// 	setupEditor('<div><b>deleteme</b>{{0}}</div>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const pTagID = previousDOM.children[0].tagID;
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// All the deletions until we get to the "<" should leave the document in an invalid state.
		// 		result = deleteAndExpect(editor, previousDOM, offsets[0], 14);
		// 		expect(result.finalInvalid).toBe(true);

		// 		// We're exiting an invalid state, so we pass "true" for the final argument
		// 		// here, which forces a full reparse (the same as getUnappliedEdits() does).
		// 		deleteAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			1,
		// 			[[{type: 'elementDelete', tagID: pTagID}]],
		// 			true
		// 		);
		// 	});
		// });

		// it('should handle deleting of a single character exactly between two elements', () => {
		// 	setupEditor('<p><br>X{{0}}<br></p>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const pTagID = previousDOM.tagID;
		// 		const br1TagID = previousDOM.children[0].tagID;
		// 		const br2TagID = previousDOM.children[2].tagID;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		deleteAndExpect(editor, previousDOM, offsets[0], 1, [
		// 			[
		// 				{
		// 					type: 'textDelete',
		// 					parentID: pTagID,
		// 					afterID: br1TagID,
		// 					beforeID: br2TagID
		// 				}
		// 			]
		// 		]);
		// 	});
		// });

		// it('should handle typing of a new attribute character-by-character', () => {
		// 	setupEditor('<p{{0}}>some text</p>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const {tagID} = previousDOM;
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// Type a space after the tag name, then the attribute name. After the space,
		// 		// it should be valid but there should be no actual edits. After that, it should
		// 		// look like we're repeatedly adding a new empty attribute and deleting the old one.
		// 		// edits to be generated.
		// 		result = typeAndExpect(editor, previousDOM, offsets[0], ' class', [
		// 			[], // " "
		// 			[
		// 				// " c"
		// 				{type: 'attrAdd', tagID, attribute: 'c', value: ''}
		// 			],
		// 			[
		// 				// " cl"
		// 				{type: 'attrAdd', tagID, attribute: 'cl', value: ''},
		// 				{type: 'attrDelete', tagID, attribute: 'c'}
		// 			],
		// 			[
		// 				// " cla"
		// 				{type: 'attrAdd', tagID, attribute: 'cla', value: ''},
		// 				{type: 'attrDelete', tagID, attribute: 'cl'}
		// 			],
		// 			[
		// 				// " clas"
		// 				{type: 'attrAdd', tagID, attribute: 'clas', value: ''},
		// 				{type: 'attrDelete', tagID, attribute: 'cla'}
		// 			],
		// 			[
		// 				// " class"
		// 				{type: 'attrAdd', tagID, attribute: 'class', value: ''},
		// 				{type: 'attrDelete', tagID, attribute: 'clas'}
		// 			]
		// 		]);

		// 		// While typing the "=" and quoted value, nothing should happen until the quote is balanced.
		// 		result = typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'=\'myclass'
		// 		);
		// 		expect(result.finalInvalid).toBe(true);

		// 		// We're exiting an invalid state, so we pass "true" for the final argument
		// 		// here, which forces a full reparse (the same as getUnappliedEdits() does).

		// 		// When the close quote is typed, we should get an attribute change.
		// 		typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'\'',
		// 			[
		// 				[
		// 					{
		// 						type: 'attrChange',
		// 						tagID,
		// 						attribute: 'class',
		// 						value: 'myclass'
		// 					}
		// 				]
		// 			],
		// 			true
		// 		);
		// 	});
		// });

		// it('should handle deleting of an attribute character-by-character', () => {
		// 	setupEditor('<p class=\'myclass\'{{0}}>some text</p>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		const {tagID} = previousDOM;
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// Delete the attribute value starting from the end quote. We should be invalid until
		// 		// we delete the = sign.
		// 		result = deleteAndExpect(editor, previousDOM, offsets[0], 9);
		// 		expect(result.finalInvalid).toBe(true);

		// 		// We're exiting an invalid state, so we pass "true" for the final argument
		// 		// here, which forces a full reparse (the same as getUnappliedEdits() does)
		// 		// for the first edit.

		// 		// Delete the = sign, then the name, then the space. This should look like
		// 		// setting the value to "", then changing the attribute name, then an empty edit.
		// 		deleteAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			6,
		// 			[
		// 				[
		// 					// " class"
		// 					{
		// 						type: 'attrChange',
		// 						tagID,
		// 						attribute: 'class',
		// 						value: ''
		// 					}
		// 				],
		// 				[
		// 					// " clas"
		// 					{type: 'attrAdd', tagID, attribute: 'clas', value: ''},
		// 					{type: 'attrDelete', tagID, attribute: 'class'}
		// 				],
		// 				[
		// 					// " cla"
		// 					{type: 'attrAdd', tagID, attribute: 'cla', value: ''},
		// 					{type: 'attrDelete', tagID, attribute: 'clas'}
		// 				],
		// 				[
		// 					// " cl"
		// 					{type: 'attrAdd', tagID, attribute: 'cl', value: ''},
		// 					{type: 'attrDelete', tagID, attribute: 'cla'}
		// 				],
		// 				[
		// 					// " c"
		// 					{type: 'attrAdd', tagID, attribute: 'c', value: ''},
		// 					{type: 'attrDelete', tagID, attribute: 'cl'}
		// 				],
		// 				[
		// 					// " "
		// 					{type: 'attrDelete', tagID, attribute: 'c'}
		// 				],
		// 				[] // Deletion of space
		// 			],
		// 			true
		// 		);
		// 	});
		// });

		// it('should handle wrapping a tag around some text character by character', () => {
		// 	setupEditor('<p>{{0}}some text{{1}}</p>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// Type the opening tag--should be invalid all the way
		// 		result = typeAndExpect(editor, previousDOM, offsets[0], '<span>');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// Type the end tag--should be invalid until we type the closing character
		// 		// The offset is 6 characters later than the original position of offset 1 since we
		// 		// inserted the opening tag.
		// 		result = typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			{line: offsets[1].line, ch: offsets[1].ch + 6},
		// 			'</span',
		// 			null,
		// 			true
		// 		);
		// 		expect(result.finalInvalid).toBe(true);

		// 		// Finally become valid by closing the end tag.
		// 		typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'>',
		// 			[
		// 				function (dom) {
		// 					// Check for tagIDs relative to the DOM after typing
		// 					return [
		// 						{
		// 							type: 'textDelete',
		// 							parentID: dom.tagID
		// 						},
		// 						{
		// 							type: 'elementInsert',
		// 							tag: 'span',
		// 							attributes: {},
		// 							tagID: dom.children[0].tagID,
		// 							parentID: dom.tagID,
		// 							lastChild: true
		// 						},
		// 						{
		// 							type: 'textInsert',
		// 							parentID: dom.children[0].tagID,
		// 							content: 'some text',
		// 							lastChild: true
		// 						}
		// 					];
		// 				}
		// 			],
		// 			true
		// 		); // Because we were invalid before this operation
		// 	});
		// });

		// it('should handle adding an <html> tag into an empty document', () => {
		// 	setupEditor('');
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		// Nothing to mark since it's currently an empty document.
		// 		expect(previousDOM).toBe(null);

		// 		// Type the opening tag--should be invalid all the way
		// 		result = typeAndExpect(editor, previousDOM, {line: 0, ch: 0}, '<html');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// Finally become valid by closing the start tag. Note that this elementInsert
		// 		// should be treated specially by RemoteFunctions not to actually insert the
		// 		// element, but just copy its ID to the autocreated HTML element.
		// 		result = typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'>',
		// 			[
		// 				function (dom) {
		// 					// Check for tagIDs relative to the DOM after typing
		// 					return [
		// 						{
		// 							type: 'elementInsert',
		// 							tag: 'html',
		// 							attributes: {},
		// 							tagID: dom.tagID,
		// 							parentID: null
		// 						}
		// 					];
		// 				}
		// 			],
		// 			true
		// 		); // Because we were invalid before this operation

		// 		// Make sure the mark got properly applied
		// 		const marks = editor._codeMirror.getAllMarks();
		// 		expect(marks.length).toBe(1);
		// 		expect(marks[0].tagID).toEqual(result.finalDOM.tagID);
		// 	});
		// });

		// it('should handle adding a <head> tag into a document', () => {
		// 	setupEditor('<html>{{0}}</html>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// Type the opening tag--should be invalid all the way
		// 		result = typeAndExpect(editor, previousDOM, offsets[0], '<head></head');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// Finally become valid by closing the end tag. Note that this elementInsert
		// 		// should be treated specially by RemoteFunctions not to actually insert the
		// 		// element, but just copy its ID to the autocreated HTML element.
		// 		result = typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'>',
		// 			[
		// 				function (dom) {
		// 					// Check for tagIDs relative to the DOM after typing
		// 					return [
		// 						{
		// 							type: 'elementInsert',
		// 							tag: 'head',
		// 							attributes: {},
		// 							tagID: dom.children[0].tagID,
		// 							parentID: dom.tagID,
		// 							lastChild: true
		// 						}
		// 					];
		// 				}
		// 			],
		// 			true
		// 		); // Because we were invalid before this operation
		// 	});
		// });

		// it('should handle adding a <body> tag into a document', () => {
		// 	setupEditor('<html><head></head>{{0}}</html>', true);
		// 	runs(() => {
		// 		const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
		// 		let result;

		// 		HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

		// 		// Type the opening tag--should be invalid all the way
		// 		result = typeAndExpect(editor, previousDOM, offsets[0], '<body');
		// 		expect(result.finalInvalid).toBe(true);

		// 		// Finally become valid by closing the start tag. Note that this elementInsert
		// 		// should be treated specially by RemoteFunctions not to actually insert the
		// 		// element, but just copy its ID to the autocreated HTML element.
		// 		result = typeAndExpect(
		// 			editor,
		// 			result.finalDOM,
		// 			result.finalPos,
		// 			'>',
		// 			[
		// 				function (dom) {
		// 					// Check for tagIDs relative to the DOM after typing
		// 					return [
		// 						{
		// 							type: 'elementInsert',
		// 							tag: 'body',
		// 							attributes: {},
		// 							tagID: dom.children[1].tagID,
		// 							parentID: dom.tagID,
		// 							lastChild: true
		// 						}
		// 					];
		// 				}
		// 			],
		// 			true
		// 		); // Because we were invalid before this operation
		// 	});
		// });

		// it('should handle adding a space after </html>', () => {
		// 	setupEditor('<html></html>', true);
		// 	runs(() => {
		// 		doEditTest(
		// 			editor.document.getText(),
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(' ', {line: 0, ch: 13});
		// 			},
		// 			(result, previousDOM, incremental) => {},
		// 			true
		// 		);
		// 	});
		// });

		// it('should represent simple new tag insert', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('<div>New Content</div>', {
		// 					line: 15,
		// 					ch: 0
		// 				});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[5];
		// 				expect(newElement.tag).toEqual('div');
		// 				expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
		// 				expect(newElement.children[0].content).toEqual('New Content');
		// 				expect(result.edits.length).toEqual(4);
		// 				const beforeID = newElement.parent.children[7].tagID;
		// 				const afterID = newElement.parent.children[3].tagID;

		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textReplace',
		// 					parentID: newElement.parent.tagID,
		// 					afterID,
		// 					beforeID,
		// 					content: '\n\n'
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					parentID: newElement.parent.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.parent.tagID,
		// 					afterID: newElement.tagID,
		// 					beforeID,
		// 					content: '\n\n'
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: 'New Content',
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should be able to add two tags at once', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'<div>New Content</div><div>More new content</div>',
		// 					{line: 15, ch: 0}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[5];
		// 				const newElement2 = newDOM.children[3].children[6];
		// 				expect(newElement.tag).toEqual('div');
		// 				expect(newElement2.tag).toEqual('div');
		// 				expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
		// 				expect(newElement2.tagID).not.toEqual(newElement.tagID);
		// 				expect(newElement.children[0].content).toEqual('New Content');
		// 				expect(newElement2.children[0].content).toEqual('More new content');
		// 				expect(result.edits.length).toEqual(6);
		// 				const beforeID = newElement.parent.children[8].tagID;
		// 				const afterID = newElement.parent.children[3].tagID;
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textReplace',
		// 					parentID: newElement.parent.tagID,
		// 					afterID,
		// 					beforeID,
		// 					content: '\n\n'
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					parentID: newElement.parent.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement2.tagID,
		// 					parentID: newElement2.parent.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement2.parent.tagID,
		// 					afterID: newElement2.tagID,
		// 					beforeID,
		// 					content: '\n\n'
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement2.tagID,
		// 					content: 'More new content',
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[5]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: 'New Content',
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should be able to paste a tag with a nested tag', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'<div>New <em>Awesome</em> Content</div>',
		// 					{line: 13, ch: 0}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;

		// 				const newElement = newDOM.children[3].children[3];
		// 				const newChild = newElement.children[1];
		// 				expect(newElement.tag).toEqual('div');
		// 				expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
		// 				expect(newElement.children.length).toEqual(3);
		// 				expect(newElement.children[0].content).toEqual('New ');
		// 				expect(newChild.tag).toEqual('em');
		// 				expect(newChild.tagID).not.toEqual(newElement.tagID);
		// 				expect(newChild.children.length).toEqual(1);
		// 				expect(newChild.children[0].content).toEqual('Awesome');
		// 				expect(newElement.children[2].content).toEqual(' Content');
		// 				expect(result.edits.length).toEqual(5);

		// 				const beforeID = newElement.parent.children[4].tagID;
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					parentID: newElement.parent.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: 'New ',
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'em',
		// 					attributes: {},
		// 					tagID: newChild.tagID,
		// 					parentID: newElement.tagID,
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: ' Content',
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newChild.tagID,
		// 					content: 'Awesome',
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle inserting an element as the first child', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('<div>New Content</div>', {
		// 					line: 10,
		// 					ch: 12
		// 				});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[0];
		// 				const {parent} = newElement;
		// 				const parentID = parent.tagID;
		// 				const beforeID = parent.children[2].tagID;

		// 				// TODO: More optimally, this would take
		// 				// 2 edits rather than 4:
		// 				// * an elementInsert for the new element
		// 				// * a textInsert for the new text of the
		// 				//   new element.
		// 				//
		// 				// It current requires 4 edits because the
		// 				// whitespace text node that comes after
		// 				// the body tag is deleted and recreated
		// 				expect(result.edits.length).toBe(4);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textDelete',
		// 					parentID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					parentID,
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textInsert',
		// 					parentID,
		// 					content: '\n\n',
		// 					afterID: newElement.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: 'New Content',
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle inserting an element as the last child', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				// Insert a new element at the end of a paragraph
		// 				editor.document.replaceRange('<strong>New Content</strong>', {
		// 					line: 33,
		// 					ch: 0
		// 				});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[7].children[3];
		// 				const {parent} = newElement;
		// 				const parentID = parent.tagID;

		// 				expect(result.edits.length).toBe(2);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementInsert',
		// 					parentID,
		// 					lastChild: true,
		// 					tag: 'strong',
		// 					attributes: {},
		// 					tagID: newElement.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.tagID,
		// 					content: 'New Content',
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle inserting an element before an existing text node', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		editor.document.replaceRange('<strong>pre-edit child</strong>', {
		// 			line: 33,
		// 			ch: 0
		// 		});

		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('<strong>New Content</strong>', {
		// 					line: 29,
		// 					ch: 59
		// 				});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[7].children[2];
		// 				const {parent} = newElement;
		// 				const parentID = parent.tagID;
		// 				const afterID = parent.children[1].tagID;
		// 				const beforeID = parent.children[4].tagID;

		// 				expect(result.edits.length).toBe(4);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textDelete',
		// 					parentID,
		// 					afterID,
		// 					beforeID
		// 				});

		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					parentID,
		// 					beforeID,
		// 					tag: 'strong',
		// 					attributes: {},
		// 					tagID: newElement.tagID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textInsert',
		// 					parentID,
		// 					content: jasmine.any(String),
		// 					afterID: newElement.tagID,
		// 					beforeID
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should represent simple new tag insert immediately after previous tag before text before tag', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		let ed;

		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				ed = editor;
		// 				editor.document.replaceRange('<div>New Content</div>', {
		// 					line: 12,
		// 					ch: 38
		// 				});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;

		// 				// First child is whitespace, second child is <h1>, third child is new tag
		// 				const newElement = newDOM.children[3].children[2];
		// 				const afterID = newElement.parent.children[1].tagID;
		// 				const beforeID = newElement.parent.children[4].tagID;
		// 				expect(newElement.tag).toEqual('div');
		// 				expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
		// 				expect(newElement.children[0].content).toEqual('New Content');

		// 				// 4 edits:
		// 				// - delete original \n
		// 				// - insert new tag
		// 				// - insert text in tag
		// 				// - re-add \n after tag
		// 				expect(result.edits.length).toEqual(4);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textDelete',
		// 					parentID: newElement.parent.tagID,
		// 					afterID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					parentID: newElement.parent.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: newElement.parent.tagID,
		// 					content: jasmine.any(String),
		// 					afterID: newElement.tagID,
		// 					beforeID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					content: 'New Content',
		// 					parentID: newElement.tagID,
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle new text insert between tags after whitespace', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('New Content', {line: 13, ch: 0});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[2];
		// 				expect(newElement.content).toEqual('\nNew Content');
		// 				expect(result.edits.length).toEqual(1);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textReplace',
		// 					content: '\nNew Content',
		// 					parentID: newElement.parent.tagID,
		// 					afterID: newDOM.children[3].children[1].tagID,
		// 					beforeID: newDOM.children[3].children[3].tagID
		// 				});
		// 				if (incremental) {
		// 					// This should have been an incremental edit since it was just text
		// 					expect(result._wasIncremental).toBe(true);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle inserting an element in the middle of text', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('<img>', {line: 12, ch: 19});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newDOM = result.dom;
		// 				const newElement = newDOM.children[3].children[1].children[1];

		// 				expect(newElement.tag).toEqual('img');
		// 				expect(newDOM.children[3].children[1].children[0].content).toEqual(
		// 					'GETTING STARTED'
		// 				);
		// 				expect(newDOM.children[3].children[1].children[2].content).toEqual(
		// 					' WITH BRACKETS'
		// 				);
		// 				expect(result.edits.length).toEqual(3);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'textReplace',
		// 					content: 'GETTING STARTED',
		// 					parentID: newElement.parent.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'img',
		// 					attributes: {},
		// 					tagID: newElement.tagID,
		// 					parentID: newElement.parent.tagID,
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textInsert',
		// 					content: ' WITH BRACKETS',
		// 					parentID: newElement.parent.tagID,
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle reordering of children in one step as a delete/insert', () => {
		// 	setupEditor('<p>{{0}}<img><br>{{1}}</p>', true);
		// 	let oldImgID;
		// 	let oldBrID;
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				oldImgID = previousDOM.children[0].tagID;
		// 				oldBrID = previousDOM.children[1].tagID;
		// 				editor.document.replaceRange('<br><img>', offsets[0], offsets[1]);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const newBrElement = result.dom.children[0];
		// 				const newImgElement = result.dom.children[1];

		// 				expect(result.edits.length).toEqual(4);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: oldImgID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: oldBrID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'br',
		// 					attributes: {},
		// 					tagID: newBrElement.tagID,
		// 					parentID: result.dom.tagID,
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'img',
		// 					attributes: {},
		// 					tagID: newImgElement.tagID,
		// 					parentID: result.dom.tagID,
		// 					lastChild: true
		// 				});

		// 				if (incremental) {
		// 					// This should not have been an incremental edit since it changed the DOM structure
		// 					expect(result._wasIncremental).toBe(false);
		// 				}
		// 			}
		// 		);
		// 	});
		// });

		// it('should support deleting across tags', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'',
		// 					{line: 20, ch: 11},
		// 					{line: 28, ch: 3}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				if (incremental) {
		// 					return;
		// 				}

		// 				const newDOM = result.dom;
		// 				const modifiedParagraph = newDOM.children[3].children[5];
		// 				expect(modifiedParagraph.tag).toEqual('p');
		// 				expect(modifiedParagraph.children.length).toEqual(3);

		// 				const emTag = modifiedParagraph.children[1];
		// 				expect(emTag.tag).toEqual('em');

		// 				const deletedParagraph = previousDOM.children[3].children[7];
		// 				expect(deletedParagraph.tag).toEqual('p');

		// 				const aTag = previousDOM.children[3].children[9];
		// 				expect(aTag.tag).toEqual('a');

		// 				expect(result.edits.length).toEqual(6);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'rememberNodes',
		// 					tagIDs: [emTag.tagID]
		// 				});

		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: deletedParagraph.tagID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textReplace',
		// 					content: '\n\n\n',
		// 					parentID: modifiedParagraph.parent.tagID,
		// 					afterID: modifiedParagraph.tagID,
		// 					beforeID: aTag.tagID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textReplace',
		// 					content: '\n    Welcome\n    ',
		// 					parentID: modifiedParagraph.tagID
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'elementMove',
		// 					tagID: emTag.tagID,
		// 					parentID: modifiedParagraph.tagID,
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[5]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: modifiedParagraph.tagID,
		// 					lastChild: true,
		// 					content: jasmine.any(String)
		// 				});
		// 			}
		// 		);
		// 	});
		// });

		// it('should support reparenting a node with new parent under the old parent', () => {
		// 	setupEditor(WellFormedDoc);
		// 	let currentText = WellFormedDoc;
		// 	let movingParagraph;
		// 	let newDiv;
		// 	runs(() => {
		// 		doEditTest(
		// 			currentText,
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange('<div>Hello</div>', {
		// 					line: 14,
		// 					ch: 0
		// 				});
		// 				currentText = editor.document.getText();
		// 			},
		// 			(result, previousDOM, incremental) => {},
		// 			false
		// 		);
		// 	});
		// 	runs(() => {
		// 		doEditTest(
		// 			currentText,
		// 			(editor, previousDOM) => {
		// 				movingParagraph = previousDOM.children[3].children[7];
		// 				newDiv = previousDOM.children[3].children[5];
		// 				editor.document.replaceRange(
		// 					'',
		// 					{line: 14, ch: 10},
		// 					{line: 14, ch: 16}
		// 				);
		// 				editor.document.replaceRange('</div>', {line: 24, ch: 0});
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(movingParagraph.tag).toBe('p');
		// 				expect(newDiv.tag).toBe('div');
		// 				expect(result.edits.length).toBe(5);
		// 				expect(result.edits[0].type).toBe('rememberNodes');
		// 				expect(result.edits[0].tagIDs).toEqual([movingParagraph.tagID]);

		// 				// The text replace should not refer to the moving node, because it is
		// 				// going to be removed from the DOM.
		// 				expect(result.edits[1].type).toEqual('textReplace');
		// 				expect(result.edits[1].afterID).not.toEqual(movingParagraph.tagID);
		// 				expect(result.edits[1].beforeID).not.toEqual(movingParagraph.tagID);

		// 				expect(result.edits[3].type).toBe('elementMove');
		// 				expect(result.edits[3].tagID).toBe(movingParagraph.tagID);
		// 				expect(result.edits[3].parentID).toBe(newDiv.tagID);
		// 			},
		// 			false
		// 		);
		// 	});
		// });

		// it('should support undo of a tag merge', () => {
		// 	setupEditor(WellFormedDoc);
		// 	let currentText = WellFormedDoc;
		// 	runs(() => {
		// 		doEditTest(
		// 			currentText,
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'',
		// 					{line: 23, ch: 0},
		// 					{line: 29, ch: 0}
		// 				);
		// 				currentText = editor.document.getText();
		// 			},
		// 			(result, previousDOM, incremental) => {},
		// 			false
		// 		);
		// 	});
		// 	runs(() => {
		// 		doEditTest(
		// 			currentText,
		// 			(editor, previousDOM) => {
		// 				editor.undo();
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const emNode = previousDOM.children[3].children[5].children[1];
		// 				expect(emNode.tag).toBe('em');

		// 				expect(result.edits.length).toBe(7);

		// 				let edit = result.edits[0];
		// 				expect(edit.type).toBe('rememberNodes');
		// 				expect(edit.tagIDs).toEqual([emNode.tagID]);

		// 				edit = result.edits[1];
		// 				expect(edit.type).toBe('elementInsert');
		// 				expect(edit.tag).toBe('p');
		// 				const newParaID = edit.tagID;

		// 				edit = result.edits[5];
		// 				expect(edit.type).toBe('elementMove');
		// 				expect(edit.tagID).toBe(emNode.tagID);
		// 				expect(edit.parentID).toBe(newParaID);
		// 			},
		// 			false,
		// 			true
		// 		);
		// 	});
		// });

		// it('should handle tag changes', () => {
		// 	setupEditor(WellFormedDoc);
		// 	let heading;
		// 	let h1;
		// 	let para;
		// 	runs(() => {
		// 		doEditTest(
		// 			WellFormedDoc,
		// 			(editor, previousDOM) => {
		// 				heading = previousDOM.children[3].children[3];
		// 				h1 = previousDOM.children[3].children[1];
		// 				para = previousDOM.children[3].children[5];
		// 				editor.document.replaceRange(
		// 					'h3',
		// 					{line: 13, ch: 1},
		// 					{line: 13, ch: 3}
		// 				);
		// 				editor.document.replaceRange(
		// 					'h3',
		// 					{line: 13, ch: 25},
		// 					{line: 13, ch: 27}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				expect(heading.tag).toBe('h2');
		// 				expect(para.tag).toBe('p');

		// 				const newHeading = result.dom.children[3].children[3];
		// 				expect(newHeading.tag).toBe('h3');

		// 				expect(result.edits.length).toBe(5);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: heading.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textReplace',
		// 					parentID: newHeading.parent.tagID,
		// 					beforeID: para.tagID,
		// 					afterID: h1.tagID,
		// 					content: '\n'
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tagID: newHeading.tagID,
		// 					parentID: newHeading.parent.tagID,
		// 					attributes: {},
		// 					tag: 'h3',
		// 					beforeID: para.tagID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					content: '\n\n\n\n',
		// 					parentID: newHeading.parent.tagID,
		// 					beforeID: para.tagID,
		// 					afterID: newHeading.tagID
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'textInsert',
		// 					content: 'This is your guide!',
		// 					parentID: newHeading.tagID,
		// 					lastChild: true
		// 				});
		// 			},
		// 			false
		// 		);
		// 	});
		// });

		// it('should handle void element tag changes', () => {
		// 	setupEditor(WellFormedDoc);
		// 	runs(() => {
		// 		doEditTest(
		// 			WellFormedDoc,
		// 			(editor, previousDOM) => {
		// 				editor.document.replaceRange(
		// 					'br',
		// 					{line: 37, ch: 5},
		// 					{line: 37, ch: 8}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const br = result.dom.children[3].children[9].children[1];
		// 				const img = previousDOM.children[3].children[9].children[1];
		// 				expect(br.tag).toBe('br');
		// 				expect(img.tag).toBe('img');

		// 				expect(result.edits.length).toBe(4);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: img.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textReplace',
		// 					content: '\n    ',
		// 					parentID: br.parent.tagID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tagID: br.tagID,
		// 					parentID: br.parent.tagID,
		// 					attributes: {
		// 						alt: 'A screenshot showing CSS Quick Edit',
		// 						src: 'screenshots/brackets-quick-edit.png'
		// 					},
		// 					tag: 'br',
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					content: '\n',
		// 					parentID: br.parent.tagID,
		// 					lastChild: true
		// 				});
		// 			},
		// 			false
		// 		);
		// 	});
		// });

		// it('should handle tag changes with child elements', () => {
		// 	setupEditor(WellFormedDoc);
		// 	let para;
		// 	let earlierPara;
		// 	runs(() => {
		// 		doEditTest(
		// 			WellFormedDoc,
		// 			(editor, previousDOM) => {
		// 				para = previousDOM.children[3].children[7];
		// 				earlierPara = previousDOM.children[3].children[5];
		// 				editor.document.replaceRange(
		// 					'div',
		// 					{line: 28, ch: 1},
		// 					{line: 28, ch: 2}
		// 				);
		// 				editor.document.replaceRange(
		// 					'div',
		// 					{line: 33, ch: 2},
		// 					{line: 33, ch: 3}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const div = result.dom.children[3].children[7];
		// 				const em = div.children[1];
		// 				const a = result.dom.children[3].children[9];
		// 				expect(para.tag).toBe('p');
		// 				expect(div.tag).toBe('div');
		// 				expect(em.tag).toBe('em');

		// 				expect(result.edits.length).toBe(8);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'rememberNodes',
		// 					tagIDs: [em.tagID]
		// 				});

		// 				expect(result.edits[1]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: para.tagID
		// 				});

		// 				expect(result.edits[2]).toEqual({
		// 					type: 'textReplace',
		// 					content: '\n\n\n',
		// 					parentID: div.parent.tagID,
		// 					afterID: earlierPara.tagID,
		// 					beforeID: a.tagID
		// 				});

		// 				expect(result.edits[3]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'div',
		// 					tagID: div.tagID,
		// 					parentID: div.parent.tagID,
		// 					attributes: {},
		// 					beforeID: a.tagID
		// 				});

		// 				expect(result.edits[4]).toEqual({
		// 					type: 'textInsert',
		// 					content: '\n\n\n',
		// 					parentID: div.parent.tagID,
		// 					afterID: div.tagID,
		// 					beforeID: a.tagID
		// 				});

		// 				expect(result.edits[5]).toEqual({
		// 					type: 'textInsert',
		// 					content: '\n    ',
		// 					parentID: div.tagID,
		// 					lastChild: true
		// 				});

		// 				expect(result.edits[6]).toEqual({
		// 					type: 'elementMove',
		// 					tagID: em.tagID,
		// 					parentID: div.tagID,
		// 					lastChild: true
		// 				});

		// 				expect(result.edits[7]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: div.tagID,
		// 					content: jasmine.any(String),
		// 					lastChild: true
		// 				});
		// 			},
		// 			false
		// 		);
		// 	});
		// });

		// it('should handle multiple inserted tags and text', () => {
		// 	setupEditor('<h1><strong>Emphasized</strong> Hello </h1>');
		// 	let h1;
		// 	let strong;
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				h1 = previousDOM;
		// 				strong = previousDOM.children[0];
		// 				editor.document.replaceRange(
		// 					'<em>Foo</em> bar <strong>Baz!</strong>',
		// 					{line: 0, ch: 4},
		// 					{line: 0, ch: 31}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const em = result.dom.children[0];
		// 				const strong2 = result.dom.children[2];

		// 				expect(result.edits.length).toBe(8);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: strong.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textDelete',
		// 					parentID: h1.tagID
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'em',
		// 					tagID: em.tagID,
		// 					parentID: h1.tagID,
		// 					attributes: {},
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: h1.tagID,
		// 					lastChild: true,
		// 					content: ' bar '
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'strong',
		// 					tagID: strong2.tagID,
		// 					parentID: h1.tagID,
		// 					lastChild: true,
		// 					attributes: {}
		// 				});
		// 				expect(result.edits[5]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: h1.tagID,
		// 					lastChild: true,
		// 					content: ' Hello '
		// 				});

		// 				expect(result.edits[6]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: strong2.tagID,
		// 					content: 'Baz!',
		// 					lastChild: true
		// 				});
		// 				expect(result.edits[7]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: em.tagID,
		// 					content: 'Foo',
		// 					lastChild: true
		// 				});
		// 			}
		// 		);
		// 	});
		// });

		// it('should handle pasting a tag over multiple tags and text', () => {
		// 	setupEditor(
		// 		'<h1>before<strong>Strong</strong>Hello<em>Emphasized</em>after</h1>'
		// 	);
		// 	let h1;
		// 	let strong;
		// 	let em;
		// 	runs(() => {
		// 		doFullAndIncrementalEditTest(
		// 			(editor, previousDOM) => {
		// 				h1 = previousDOM;
		// 				strong = previousDOM.children[1];
		// 				em = previousDOM.children[3];
		// 				editor.document.replaceRange(
		// 					'<i>Italic</i>',
		// 					{line: 0, ch: 10},
		// 					{line: 0, ch: 57}
		// 				);
		// 			},
		// 			(result, previousDOM, incremental) => {
		// 				const i = result.dom.children[1];

		// 				expect(result.edits.length).toBe(5);
		// 				expect(result.edits[0]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: strong.tagID
		// 				});
		// 				expect(result.edits[1]).toEqual({
		// 					type: 'textReplace',
		// 					parentID: h1.tagID,
		// 					beforeID: em.tagID,
		// 					content: 'before'
		// 				});
		// 				expect(result.edits[2]).toEqual({
		// 					type: 'elementInsert',
		// 					tag: 'i',
		// 					tagID: i.tagID,
		// 					parentID: h1.tagID,
		// 					attributes: {},
		// 					beforeID: em.tagID
		// 				});
		// 				expect(result.edits[3]).toEqual({
		// 					type: 'elementDelete',
		// 					tagID: em.tagID
		// 				});
		// 				expect(result.edits[4]).toEqual({
		// 					type: 'textInsert',
		// 					parentID: i.tagID,
		// 					content: 'Italic',
		// 					lastChild: true
		// 				});
		// 			}
		// 		);
		// 	});
		// });
	});
});
