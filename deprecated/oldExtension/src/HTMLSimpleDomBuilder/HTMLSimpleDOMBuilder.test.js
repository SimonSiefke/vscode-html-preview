/* global describe, it, expect */

const {build: b} = require('./HTMLSimpleDomBuilder');

/**
 *
 * @param {string} text
 * @param {number|undefined} startOffset
 * @param {import('../types').Position|undefined} startOffsetPos
 * @param {boolean} strict
 * @param {any} expectedErrors
 */
function _build(text, startOffset, startOffsetPos, strict, expectedErrors) {
	const root = b(text) || {};
	const {errors} = root;

	if (expectedErrors) {
		expect(root.dom).toBe(undefined);
	} else {
		expect(root.dom).toBeTruthy();
	}

	// Console.log(errors);
	// console.log(expectedErrors);

	expect(errors).toEqual(expectedErrors);

	return root.dom;
}

/**
 *
 * @param {string} text
 * @param {boolean} strict
 * @param {any|undefined} expectedErrors
 */
function build(text, strict, expectedErrors = undefined) {
	return _build(text, undefined, undefined, strict, expectedErrors);
}

test('should parse a document with balanced, void and self-closing tags', () => {
	const root = build(
		'<p><b>some</b>awesome text</p><p>and <img> another <br/> para</p>',
		true
	);
	expect(root).toBeTruthy();
});

test('should parse a document with an implied-close tag followed by a tag that forces it to close', () => {
	const result = build(
		'<div><p>unclosed para<h1>heading that closes para</h1></div>',
		true
	);
	expect(result).toBeTruthy();
	expect(result.tag).toBe('div');
	expect(result.children[0].tag).toBe('p');
	expect(result.children[1].tag).toBe('h1');
});

test('should parse a document with an implied-close tag followed by an actual close tag', () => {
	// Const result = build('<div><p>unclosed para</div>', true);
	// Expect(result).toBeTruthy();
	// expect(result.tag).toBe('div');
	// expect(result.children[0].tag).toBe('p');
});

test('should parse a document with an implied-close tag at the end of the document', () => {
	// Const result = build('<body><p>hello', true);
	// expect(result).toBeTruthy();
	// expect(result.tag).toBe('body');
	// expect(result.children[0].tag).toBe('p');
	// expect(result.children[0].children[0].content).toBe('hello');
});

test('should return undefined for an unclosed non-void/non-implied-close tag', () => {
	const errors = [
		{
			token: {
				type: 'closetag',
				contents: 'p',
				start: 37,
				end: 38,
				startPos: {line: 0, ch: 37},
				endPos: {line: 0, ch: 38}
			},
			startPos: {line: 0, ch: 37},
			endPos: {line: 0, ch: 38}
		}
	];

	build('<p>this has an <b>unclosed bold tag</p>', true, errors);
});

test('should adjust for offsets when logging errors', () => {
	const errors = [
		{
			token: {
				type: 'closetag',
				contents: 'p',
				start: 38,
				end: 39,
				startPos: {line: 1, ch: 22},
				endPos: {line: 1, ch: 23}
			},
			startPos: {line: 1, ch: 22},
			endPos: {line: 1, ch: 23}
		}
	];

	_build(
		'<p>this has an \n<b>unclosed bold tag</p>',
		16,
		{line: 1, ch: 0},
		true,
		errors
	);
});

test('should return undefined for an extra close tag', () => {
	const errors = [
		{
			token: {
				type: 'closetag',
				contents: 'b',
				start: 30,
				end: 31,
				startPos: {line: 0, ch: 30},
				endPos: {line: 0, ch: 31}
			},
			startPos: {line: 0, ch: 30},
			endPos: {line: 0, ch: 31}
		}
	];

	build('<p>this has an unopened bold</b> tag</p>', true, errors);
});

test('should return undefined if there are unclosed tags at the end of the document', () => {
	const errors = [
		{
			token: undefined,
			startPos: {line: 0, ch: 0},
			endPos: {line: 0, ch: 0}
		}
	];

	build('<div>this has <b>multiple unclosed tags', true, errors);
});

test('should return undefined if there is a tokenization failure', () => {
	const errors = [
		{
			token: {
				type: 'error',
				contents: '',
				start: -1,
				end: 4,
				startPos: undefined,
				endPos: {line: 0, ch: 4}
			},
			startPos: {line: 0, ch: 4},
			endPos: {line: 0, ch: 4}
		}
	];

	build('<div<badtag></div>', true, errors);
});

test('should handle empty attributes', () => {
	const dom = build('<input disabled>', true);
	expect(dom.attributes.disabled).toEqual('');
});

test('should handle unknown self-closing tags', () => {
	const dom = build('<foo><bar/></foo>', true);
	expect(dom).toBeTruthy();
});

test('should merge text nodes around a comment', () => {
	const dom = build('<div>Text <!-- comment --> Text2</div>', true);
	expect(dom.children).toHaveLength(1);
	const textNode = dom.children[0];
	expect(textNode.content).toBe('Text  Text2');
	// Console.log(textNode);
	expect(textNode.textSignature).toBeDefined();
});

test('should build simple DOM', () => {
	// Const dom = build(WellFormedDoc);
	// expect(dom.tagID).toEqual(jasmine.any(Number));
	// expect(dom.tag).toEqual('html');
	// expect(dom.start).toEqual(16);
	// expect(dom.end).toEqual(1269);
	// expect(dom.subtreeSignature).toEqual(jasmine.any(Number));
	// expect(dom.childSignature).toEqual(jasmine.any(Number));
	// expect(dom.children.length).toEqual(5);
	// const meta = dom.children[1].children[1];
	// expect(Object.keys(meta.attributes).length).toEqual(1);
	// expect(meta.attributes.charset).toEqual('utf-8');
	// const titleContents = dom.children[1].children[5].children[0];
	// expect(titleContents.content).toEqual('GETTING STARTED WITH BRACKETS');
	// expect(titleContents.textSignature).toEqual(
	// 	MurmurHash3.hashString(
	// 		titleContents.content,
	// 		titleContents.content.length,
	// 		HTMLSimpleDOM._seed
	// 	)
	// );
	// expect(dom.children[1].parent).toEqual(dom);
	// expect(dom.nodeMap[meta.tagID]).toBe(meta);
	// expect(meta.childSignature).toEqual(jasmine.any(Number));
});

// Test.only('multiline html', () => {
// 	const dom = build(`<h1>dkkkkkkkkkdkdddddd</h1>
// 	<div>de</div>
// 	<p></p>
// 	`, false);
// 	dom
// });