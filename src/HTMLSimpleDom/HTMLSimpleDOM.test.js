/* global describe, it, expect */

const HTMLSimpleDOM = require('./HTMLSimpleDOM');
// Const WellFormedDoc = `<!DOCTYPE html>
// <html>

//     <head>
//         <meta charset="utf-8">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
//         <title>GETTING STARTED WITH BRACKETS</title>
//         <meta name="description" content="An interactive getting started guide for Brackets.">
//         <link rel="stylesheet" href="test.css">
//     </head>
//     <body>

// <h1>GETTING STARTED WITH BRACKETS</h1>
// <h2>This is your guide!</h2>

// <!--
//     MADE WITH <3 AND JAVASCRIPT
// -->

// <p>
//     Welcome to an early preview of Brackets, a new open-source editor for the next generation of
//     the web. We’re big fans of standards and want to build better tooling for JavaScript, HTML and CSS
//     and related open web technologies. This is our humble beginning.
// </p>

// <!--
//     WHAT IS BRACKETS?
// -->
// <p>
//     <em>You are looking at an early build of Brackets.</em>
//     In many ways, Brackets is a different type of editor. One notable difference is that this editor
//     is written in JavaScript. So while Brackets might not be ready for your day-to-day use quite yet,
//     we are using it every day to build Brackets.
// </p>

// <a href="screenshots/brackets-quick-edit.png">
//     <img alt="A screenshot showing CSS Quick Edit" src="screenshots/brackets-quick-edit.png" />
// </a>
//     </body>
// </html>`;
// Const MurmurHash3 = require('../murmurhash3_gc');

function _build(text, startOffset, startOffsetPos, strict, expectedErrors) {
	const builder = new HTMLSimpleDOM.Builder(text);
	const root = builder.build(strict);
	const {errors} = builder;

	if (expectedErrors) {
		expect(root).toBeNull();
	} else {
		expect(root).toBeTruthy();
	}

	expect(errors).toEqual(expectedErrors);

	return root;
}

function build(text, strict, expectedErrors) {
	return _build(text, undefined, undefined, strict, expectedErrors);
}

describe('HTML SimpleDOM', () => {
	describe('Strict HTML parsing', () => {
		it('should parse a document with balanced, void and self-closing tags', () => {
			const root = build(
				'<p><b>some</b>awesome text</p><p>and <img> another <br/> para</p>',
				true
			);
			expect(root).toBeTruthy();
		});

		it('should parse a document with an implied-close tag followed by a tag that forces it to close', () => {
			const result = build(
				'<div><p>unclosed para<h1>heading that closes para</h1></div>',
				true
			);
			expect(result).toBeTruthy();
			expect(result.tag).toBe('div');
			expect(result.children[0].tag).toBe('p');
			expect(result.children[1].tag).toBe('h1');
		});

		it('should parse a document with an implied-close tag followed by an actual close tag', () => {
			// Const result = build('<div><p>unclosed para</div>', true);
			// expect(result).toBeTruthy();
			// expect(result.tag).toBe('div');
			// expect(result.children[0].tag).toBe('p');
		});

		it('should parse a document with an implied-close tag at the end of the document', () => {
			// Const result = build('<body><p>hello', true);
			// expect(result).toBeTruthy();
			// expect(result.tag).toBe('body');
			// expect(result.children[0].tag).toBe('p');
			// expect(result.children[0].children[0].content).toBe('hello');
		});

		it('should return null for an unclosed non-void/non-implied-close tag', () => {
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

		it('should adjust for offsets when logging errors', () => {
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

		it('should return null for an extra close tag', () => {
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

		it('should return null if there are unclosed tags at the end of the document', () => {
			const errors = [
				{
					token: null,
					startPos: {line: 0, ch: 0},
					endPos: {line: 0, ch: 0}
				}
			];

			build('<div>this has <b>multiple unclosed tags', true, errors);
		});

		it('should return null if there is a tokenization failure', () => {
			const errors = [
				{
					token: {
						type: 'error',
						contents: '',
						start: -1,
						end: 4,
						startPos: null,
						endPos: {line: 0, ch: 4}
					},
					startPos: {line: 0, ch: 4},
					endPos: {line: 0, ch: 4}
				}
			];

			build('<div<badtag></div>', true, errors);
		});

		it('should handle empty attributes', () => {
			const dom = build('<input disabled>', true);
			expect(dom.attributes.disabled).toEqual('');
		});

		it('should handle unknown self-closing tags', () => {
			const dom = build('<foo><bar/></foo>', true);
			expect(dom).toBeTruthy();
		});

		it('should merge text nodes around a comment', () => {
			const dom = build('<div>Text <!-- comment --> Text2</div>', true);
			expect(dom.children.length).toBe(1);
			const textNode = dom.children[0];
			expect(textNode.content).toBe('Text  Text2');
			expect(textNode.textSignature).toBeDefined();
		});

		it('should build simple DOM', () => {
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
	});
});
