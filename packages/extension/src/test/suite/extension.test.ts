import {
	TestCase,
	createTestFile,
	activateExtension,
	closeTestFile,
	setText,
	setCursorPosition,
	type
} from '../test-util';
import {before, after} from 'mocha';
import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as _ from 'lodash';

let browser: puppeteer.Browser;
let page: puppeteer.Page;
const headless = false;

before(async () => {
	await createTestFile('hello world.html');
	await setText('<h1>hello world</h1>');
	await activateExtension();
	browser = await puppeteer.launch({headless});
	page = await browser.newPage();
});

after(async () => {
	await browser.close();
});

// after(async () => {
//   closeTestFile()
// })

async function expectHtml(html) {
	const bodyChildren = await page.$eval('body', async body => {
		function getAst(nodes) {
			if (Array.isArray(nodes)) {
				return nodes.map(getAst);
			}

			const node = nodes;

			// @ts-ignore
			if (node.nodeType === Node.ELEMENT_NODE) {
				return {
					nodeType: 'ElementNode',
					// @ts-ignore
					tag: node.tagName.toLowerCase(),
					// @ts-ignore
					attributes: Array.from(node.attributes).reduce(
						(total, attribute) => ({
							...total,
							// @ts-ignore
							[attribute.name]: attribute.value
						}),
						{}
					),
					// @ts-ignore
					children: getAst(Array.from(node.childNodes))
				};
			}

			// @ts-ignore
			if (node.nodeType === Node.TEXT_NODE) {
				return {
					nodeType: 'TextNode',
					// @ts-ignore
					text: node.data
				};
			}

			// @ts-ignore
			if (node.nodeType === Node.COMMENT_NODE) {
				return {
					nodeType: 'CommentNode',
					// @ts-ignore
					text: node.data
				};
			}
		}

		let result = getAst(Array.from(body.childNodes));
		const virtualDomIndex = result.findIndex(
			// @ts-ignore
			child => child.tag === 'script' && child.attributes.id === 'virtual-dom'
		);
		result = result.slice(0, virtualDomIndex);
		// return new Promise(() => {});
		return result;
	});
	assert.deepStrictEqual(bodyChildren, html);
}

test('basic', async () => {
	await vscode.commands.executeCommand('htmlPreview.openPreview');
	await page.goto('http://localhost:3000');
	await expectHtml([
		{
			nodeType: 'ElementNode',
			tag: 'h1',
			attributes: {
				'data-id': '1'
			},
			children: [
				{
					nodeType: 'TextNode',
					text: 'hello world'
				}
			]
		},
		{
			nodeType: 'TextNode',
			text: '\n'
		}
	]);

	setCursorPosition(15);
	await type('!');
	await expectHtml([
		{
			nodeType: 'ElementNode',
			tag: 'h1',
			attributes: {
				'data-id': '1'
			},
			children: [
				{
					nodeType: 'TextNode',
					text: 'hello world!'
				}
			]
		},
		{
			nodeType: 'TextNode',
			text: '\n'
		}
	]);
	// await new Promise(() => {});
});
