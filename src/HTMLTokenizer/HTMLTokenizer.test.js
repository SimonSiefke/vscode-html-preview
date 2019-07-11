/* global describe, it, expect */

const {createTokenizer} = require('./HTMLTokenizer');

describe('HTML Tokenizer', () => {
	it('should handle tags and text', () => {
		const t = createTokenizer('<html>\n<body>Hello</body>\n</html>');
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'html',
			start: 1,
			end: 5,
			startPos: {line: 0, ch: 1},
			endPos: {line: 0, ch: 5}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagend',
			contents: '',
			start: -1,
			end: 6,
			startPos: undefined,
			endPos: {line: 0, ch: 6}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: '\n',
			start: 6,
			end: 7,
			startPos: {line: 0, ch: 6},
			endPos: {line: 1, ch: 0}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'body',
			start: 8,
			end: 12,
			startPos: {line: 1, ch: 1},
			endPos: {line: 1, ch: 5}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagend',
			contents: '',
			start: -1,
			end: 13,
			startPos: undefined,
			endPos: {line: 1, ch: 6}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: 'Hello',
			start: 13,
			end: 18,
			startPos: {line: 1, ch: 6},
			endPos: {line: 1, ch: 11}
		});
		expect(t.nextToken()).toEqual({
			type: 'closetag',
			contents: 'body',
			start: 20,
			end: 24,
			startPos: {line: 1, ch: 13},
			endPos: {line: 1, ch: 17}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: '\n',
			start: 25,
			end: 26,
			startPos: {line: 1, ch: 18},
			endPos: {line: 2, ch: 0}
		});
		expect(t.nextToken()).toEqual({
			type: 'closetag',
			contents: 'html',
			start: 28,
			end: 32,
			startPos: {line: 2, ch: 2},
			endPos: {line: 2, ch: 6}
		});
	});

	it('should handle attributes', () => {
		const t = createTokenizer(
			'<div class=\'foo bar\' style="baz: quux" checked></div>'
		);
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'div',
			start: 1,
			end: 4,
			startPos: {line: 0, ch: 1},
			endPos: {line: 0, ch: 4}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribname',
			contents: 'class',
			start: 5,
			end: 10,
			startPos: {line: 0, ch: 5},
			endPos: {line: 0, ch: 10}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribvalue',
			contents: 'foo bar',
			start: 12,
			end: 19,
			startPos: {line: 0, ch: 12},
			endPos: {line: 0, ch: 19}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribname',
			contents: 'style',
			start: 21,
			end: 26,
			startPos: {line: 0, ch: 21},
			endPos: {line: 0, ch: 26}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribvalue',
			contents: 'baz: quux',
			start: 28,
			end: 37,
			startPos: {line: 0, ch: 28},
			endPos: {line: 0, ch: 37}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribname',
			contents: 'checked',
			start: 39,
			end: 46,
			startPos: {line: 0, ch: 39},
			endPos: {line: 0, ch: 46}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagend',
			contents: '',
			start: -1,
			end: 47,
			startPos: undefined,
			endPos: {line: 0, ch: 47}
		});
		expect(t.nextToken()).toEqual({
			type: 'closetag',
			contents: 'div',
			start: 49,
			end: 52,
			startPos: {line: 0, ch: 49},
			endPos: {line: 0, ch: 52}
		});
		expect(t.nextToken()).toEqual(undefined);
	});

	it('should handle various newline cases', () => {
		const t = createTokenizer(
			'<div \n    class=\'foo\'\n    checked>\n    some text\n    with a newline\n    <br/>\n<!--multiline\ncomment-->\n</div>'
		);
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'div',
			start: 1,
			end: 4,
			startPos: {line: 0, ch: 1},
			endPos: {line: 0, ch: 4}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribname',
			contents: 'class',
			start: 10,
			end: 15,
			startPos: {line: 1, ch: 4},
			endPos: {line: 1, ch: 9}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribvalue',
			contents: 'foo',
			start: 17,
			end: 20,
			startPos: {line: 1, ch: 11},
			endPos: {line: 1, ch: 14}
		});
		expect(t.nextToken()).toEqual({
			type: 'attribname',
			contents: 'checked',
			start: 26,
			end: 33,
			startPos: {line: 2, ch: 4},
			endPos: {line: 2, ch: 11}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagend',
			contents: '',
			start: -1,
			end: 34,
			startPos: undefined,
			endPos: {line: 2, ch: 12}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: '\n    some text\n    with a newline\n    ',
			start: 34,
			end: 72,
			startPos: {line: 2, ch: 12},
			endPos: {line: 5, ch: 4}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'br',
			start: 73,
			end: 75,
			startPos: {line: 5, ch: 5},
			endPos: {line: 5, ch: 7}
		});
		expect(t.nextToken()).toEqual({
			type: 'selfclosingtag',
			contents: '',
			start: -1,
			end: 77,
			startPos: undefined,
			endPos: {line: 5, ch: 9}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: '\n',
			start: 77,
			end: 78,
			startPos: {line: 5, ch: 9},
			endPos: {line: 6, ch: 0}
		});
		expect(t.nextToken()).toEqual({
			type: 'comment',
			contents: 'multiline\ncomment',
			start: 82,
			end: 99,
			startPos: {line: 6, ch: 4},
			endPos: {line: 7, ch: 7}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: '\n',
			start: 102,
			end: 103,
			startPos: {line: 7, ch: 10},
			endPos: {line: 8, ch: 0}
		});
		expect(t.nextToken()).toEqual({
			type: 'closetag',
			contents: 'div',
			start: 105,
			end: 108,
			startPos: {line: 8, ch: 2},
			endPos: {line: 8, ch: 5}
		});
	});

	it('should notify of explicit shorttags like <br/>', () => {
		const t = createTokenizer('<p>hello<br/></p>');
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'p',
			start: 1,
			end: 2,
			startPos: {line: 0, ch: 1},
			endPos: {line: 0, ch: 2}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagend',
			contents: '',
			start: -1,
			end: 3,
			startPos: undefined,
			endPos: {line: 0, ch: 3}
		});
		expect(t.nextToken()).toEqual({
			type: 'text',
			contents: 'hello',
			start: 3,
			end: 8,
			startPos: {line: 0, ch: 3},
			endPos: {line: 0, ch: 8}
		});
		expect(t.nextToken()).toEqual({
			type: 'opentagname',
			contents: 'br',
			start: 9,
			end: 11,
			startPos: {line: 0, ch: 9},
			endPos: {line: 0, ch: 11}
		});
		expect(t.nextToken()).toEqual({
			type: 'selfclosingtag',
			contents: '',
			start: -1,
			end: 13,
			startPos: undefined,
			endPos: {line: 0, ch: 13}
		});
		expect(t.nextToken()).toEqual({
			type: 'closetag',
			contents: 'p',
			start: 15,
			end: 16,
			startPos: {line: 0, ch: 15},
			endPos: {line: 0, ch: 16}
		});
	});

	it('should parse a comment', () => {
		const t = createTokenizer('<!--very important-->');
		expect(t.nextToken()).toEqual({
			type: 'comment',
			contents: 'very important',
			start: 4,
			end: 18,
			startPos: {line: 0, ch: 4},
			endPos: {line: 0, ch: 18}
		});
	});

	describe('error cases', () => {
		function expectError(text, isError) {
			if (isError === undefined) {
				isError = true;
			}

			const t = createTokenizer(text);
			let token = t.nextToken();
			while (token) {
				if (token.type === 'error') {
					if (!isError) {
						expect('found an error token').toBe(false);
					}

					return;
				}

				token = t.nextToken();
			}

			if (isError) {
				expect('found an error token').toBe(true);
			}
		}

		it('should not fail for a comment', () => {
			expectError('<!--a comment-->', false);
		});
		it('should not fail for a tag with a mix of attribute styles', () => {
			expectError(
				'<goodtag goodname=goodvalue goodname=\'goodvalue\' goodname="goodvalue" goodemptyname attrwithspace = attrval></goodtag>',
				false
			);
		});
		it('should not fail for a tag with a quoted attribute at the end of the tag', () => {
			expectError('<goodtag goodname="goodvalue"></goodtag>', false);
		});
		it('should not fail for a tag with a quoted attribute followed by whitespace at the end of the tag', () => {
			expectError('<goodtag goodname="goodvalue" ></goodtag>', false);
		});
		it('should not fail for a tag with an unquoted attribute followed by whitespace at the end of the tag', () => {
			expectError('<goodtag goodname=goodvalue ></goodtag>', false);
		});
		it('should fail for an angle bracket before a tag', () => {
			expectError('<<notatag>');
		});
		it('should fail for an angle bracket in a tag', () => {
			expectError('<not<atag>');
		});
		it('should fail for an angle bracket before an attribute name', () => {
			expectError('<tag <notattr>');
		});
		it('should fail for an angle bracket in an attribute name', () => {
			expectError('<tag not<attr>');
		});
		it('should fail for an angle bracket before a value', () => {
			expectError('<tag attr=<notvalue>');
		});
		it('should fail for an angle bracket inside a value', () => {
			expectError('<tag attr=not<value>');
		});
		it('should fail for an angle bracket before a close tag', () => {
			expectError('</<notatag>');
		});
		it('should fail for an angle bracket in a close tag', () => {
			expectError('</not<atag>');
		});
		it('should fail for unclosed open tag at EOF', () => {
			expectError('<unclosedopentag');
		});
		it('should fail for unfinished attr at EOF', () => {
			expectError('<tag unfinishedattr=');
		});
		it('should fail for unfinished single-quoted value at EOF', () => {
			expectError('<tag attr=\'unfinishedval');
		});
		it('should fail for unfinished double-quoted value at EOF', () => {
			expectError('<tag attr="unfinishedval');
		});
		it('should fail for extra text between / and > in a self-close tag', () => {
			expectError('<img / >');
		});
		it('should fail for unmatched double-quotes when there is a slash after the next double-quote', () => {
			expectError('<p style="something></p><img src="foo/bar">');
		});
		it('should fail if there is no whitespace between the end of an attribute and the next attribute name', () => {
			expectError('<p attr="val"attr2="val"></p>');
		});
		it('should allow a hyphen in a custom tag name', () => {
			expectError('<custom-tag></custom-tag>', false);
		});
	});
});
