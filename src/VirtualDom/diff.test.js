/* eslint-disable jest/no-disabled-tests */
import {parseHtml} from './parse';
import {domdiff} from './diff';

/**
 *
 * @param {any} testCases
 */
function run(testCases) {
	for (const testCase of testCases) {
		const previousDom = parseHtml(testCase.previousDom);
		const nextDom = parseHtml(testCase.nextDom);
		const edits = domdiff(previousDom, nextDom);
		expect(edits).toEqual(testCase.expectedEdits);
	}
}

test('no diffs', () => {
	const testCases = [
		{
			previousDom: '',
			nextDom: '',
			expectedEdits: []
		},
		{
			previousDom: '<h1></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: []
		},
		{
			previousDom: '<h1 class="green"></h1>',
			nextDom: '<h1 class="green"></h1>',
			expectedEdits: []
		},
		{
			previousDom: '<h1>hello world</h1>',
			nextDom: '<h1>hello world</h1>',
			expectedEdits: []
		},
		{
			previousDom: '<h1>hello</h1><h1>world</h1>',
			nextDom: '<h1>hello</h1><h1>world</h1>',
			expectedEdits: []
		}
	];
	run(testCases);
});

test('attribute diffs', () => {
	const testCases = [
		{
			previousDom: '<h1 class></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: [
				{
					command: 'attributeDelete',
					payload: {
						attribute: 'class',
						id: 1
					}
				}
			]
		},
		{
			previousDom: '<h1 class></h1>',
			nextDom: '<h1 class="green"></h1>',
			expectedEdits: [
				{
					command: 'attributeChange',
					payload: {
						attribute: 'class',
						id: 1,
						value: '"green"'
					}
				}
			]
		},
		{
			previousDom: '<h1 class="gre"></h1>',
			nextDom: '<h1 class="green"></h1>',
			expectedEdits: [
				{
					command: 'attributeChange',
					payload: {

						attribute: 'class',
						id: 1,
						value: '"green"'
					}
				}
			]
		}
	];
	run(testCases);
});

test('insert diffs', () => {
	const testCases = [
		{
			previousDom: '<h1>hello</h1>',
			nextDom: '<h1>hello</h1><h1>world</h1>',
			expectedEdits: [
				{
					command: 'elementInsert',
					payload: {
						id: 3,
						parentId: 0,
						nodeType: 'ElementNode',
						tag: 'h1'
					}
				},
				{
					command: 'elementInsert',
					payload: {

						id: 4,
						parentId: 3,
						nodeType: 'TextNode',
						text: 'world'
					}
				}
			]
		}
	];
	run(testCases);
});

test('delete diffs', () => {
	const testCases = [
		{
			previousDom: '<h1>hello</h1>',
			nextDom: '',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 1
					}
				}
			]
		},
		{
			previousDom: '<h1></h1>',
			nextDom: '',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 1
					}
				}
			]
		},
		{
			previousDom: '<h1><h1></h1></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 2
					}
				}
			]
		},
		{
			previousDom: '<h1></h1><h1></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 2
					}
				}
			]
		},
		{
			previousDom: '<h1><h1><p>hello world</p></h1></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 2
					}
				}
			]
		},
		{
			previousDom: '<h1><p>hello</p><p>world</p></h1>',
			nextDom: '<h1></h1>',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 2
					}
				},
				{
					command: 'elementDelete',
					payload: {

						id: 4
					}
				}
			]
		}
	];
	run(testCases);
});

test('update text diffs', () => {
	const testCases = [
		{
			previousDom: 'hello',
			nextDom: 'hello world',
			expectedEdits: [
				{
					command: 'textReplace',
					payload: {

						id: 1,
						text: 'hello world'
					}
				}
			]
		},
		{
			previousDom: '<!--hello-->',
			nextDom: '<!--hello world-->',
			expectedEdits: [
				{
					command: 'textReplace',
					payload: {

						id: 1,
						text: 'hello world'
					}
				}
			]
		}
	];
	run(testCases);
});

test('mixed diffs', () => {
	const testCases = [
		{
			previousDom: 'hello world',
			nextDom: '<!--hello world-->',
			expectedEdits: [
				{
					command: 'elementDelete',
					payload: {

						id: 1
					}
				},
				{
					command: 'elementInsert',
					payload: {

						nodeType: 'CommentNode',
						text: 'hello world',
						id: 1,
						parentId: 0
					}
				}
			]
		}

	];
	run(testCases);
});

test('incremental diff', () => {
