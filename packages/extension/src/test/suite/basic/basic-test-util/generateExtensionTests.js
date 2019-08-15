const fs = require('fs');
const path = require('path');
const {toJson} = require('really-relaxed-json');
const {validate} = require('jsonschema');

const testFileNames = [
	'basic.test.txt',
	'emmet.test.txt',
	'text-from-scratch.test.txt',
	'attribute-delete-1.test.txt',
	'useless-whitespace-change-1.test.txt',
	'useless-whitespace-change-2.test.txt',
	'attribute-change-1.test.txt',
	'attribute-change-2.test.txt',
	'basic-text-insertion.test.txt',
	'basic-element-insertion.test.txt',
	'basic-text-replace.test.txt',
	'basic-text-addition.test.txt',
	'element-addition-at-the-end.test.txt',
	'element-addition-at-the-start.test.txt',
	'text-insertion-in-nested-html.test.txt',
	'insertion-of-attribute-with-value.test.txt',
	'insertion-of-attribute-without-value.test.txt',
	'insertion-of-multiple-elements-and-text-nodes.test.txt',
	'attribute-name-change.test.txt',
	'attribute-value-insertion-at-the-end.test.txt',
	'attribute-value-replacement.test.txt'
];
const headless = true;
testFileNames.length; // ?
// const testFileNames = ['text-from-scratch.txt'];

const importCode = `
import {
  createTestFile,
  activateExtension,
  setText,
} from '../../../../test-util'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'
`;

function genSingle(testCase) {
	const edit = testCase.edits[0];
	return `
	{
		const edit = ${JSON.stringify(edit, null, 2)}
  const vscodeEdit = new vscode.WorkspaceEdit()
  const {document} = vscode.window.activeTextEditor
  vscodeEdit.replace(
    uri,
    new vscode.Range(
      document.positionAt(edit.rangeOffset),
      document.positionAt(edit.rangeOffset + edit.rangeLength)
    ),
    edit.text
  )
	await vscode.workspace.applyEdit(vscodeEdit)
	waitForUpdateStart(page)
	const html = await page.content()
	await waitForUpdateEnd(page)
	assert.equal(adjust(html), \`${testCase.expectedDom}\`);
	
		}`;
}

/**
 *
 * @param {{fileName:string,testCases:any[]}} options
 */
function generateTestCase({fileName, testCases}) {
	const testCaseName = fileName.replace(/\.test\.txt$/, '');
	const edit = testCases[0].edits[0]; // ?
	const singles = testCases.map(genSingle);
	return `${importCode}
const headless = ${headless}

function getBrowser(){
	return puppeteer.launch({headless, args: ['--no-sandbox']})
}

let received = false 

function waitForUpdateStart(page){
	received = false
	page._client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
		received = true
	})
}
function waitForUpdateEnd(page){
	return new Promise(resolve=>{
		if(received){
			resolve()
		} else{
			page._client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
				resolve()
			})
		}
	})
}

function adjust(html) {
	return html.replace('\\n<script type="module" src="html-preview.js"></script>', '').replace('<script type="module" src="html-preview.js"></script>', '').replace(/ data-id="\\d*"/g, '');
}

test('${testCaseName}', async () => {
	const uri = await createTestFile('${testCaseName}.html')
  await setText(\`${testCases[0].previousText}\`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'})
	${singles.join('\n')}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
`;
}

function parseJson(json) {
	return JSON.parse(toJson(json));
}

const editsSchema = {
	type: 'array',
	items: {
		type: 'object',
		additionalProperties: false,
		properties: {
			rangeLength: {
				type: 'number'
			},
			rangeOffset: {
				type: 'number'
			},
			text: {
				type: 'string'
			}
		}
	}
};

function validatePreviousText(previousText) {
	return typeof previousText === 'string';
}

function validateNextText(nextText) {
	return typeof nextText === 'string';
}

function validateEdits(edits) {
	const result = validate(edits, editsSchema); // ?
	if (result.errors.length > 0) {
		throw new Error(JSON.stringify(result.errors, null, 2));
	}
}

function validateExpectedDom(expectedDom) {
	return typeof expectedDom === 'string';
}

function validateTestCase(testCase, testCaseName) {
	const expectedNextText = [];
	let index = 0;
	let deleted = 0;
	let inserted = 0;
	for (const edit of testCase.edits) {
		while (index < edit.rangeOffset) {
			expectedNextText[index] = testCase.previousText[index];
			index++;
		}

		index += edit.rangeLength;
		deleted += edit.rangeLength;
		inserted += edit.text.length;
		for (let j = 0; j < edit.text.length; j++) {
			expectedNextText[index + j] = edit.text[j];
		}
	}

	while (index < testCase.previousText.length) {
		expectedNextText[index + inserted] = testCase.previousText[index];
		index++;
	}

	if (expectedNextText.join('') !== testCase.nextText) {
		console.log(expectedNextText.join('')); // ?
		console.log(testCase.nextText); // ?
		const en = expectedNextText.join('');
		for (let n = 0; n < en.length; n++) {
			if (en[n] !== testCase.nextText[n]) {
				console.log('\nindex is', n);
				console.log(
					'expected',
					en
						.slice(n, n + 10)
						.replace(/ /g, 'SPACE')
						.replace(/\n/g, 'NEWLINE'),
					'\ngot',
					testCase.nextText
						.slice(n, n + 10)
						.replace(/ /g, 'SPACE')
						.replace(/\n/g, 'NEWLINE')
				);
				break;
			}
		}

		throw new Error(`testcase ${testCaseName} is invalid, nextdom does not match specified edit`);
	}
}

function gen(fileName) {
	const basicTest = fs.readFileSync(path.join(__dirname, `../${fileName}`), 'utf-8');

	const lines = basicTest.split('\n');

	if (lines[lines.length - 1] !== '') {
		throw new Error('file must end with a new line');
	}

	let currentTest = {};
	const tests = [];
	let blockType;
	let blockContent = [];
	function finishBlock() {
		if (!blockType) {
			return;
		}

		if (blockType === 'previousText' && currentTest.previousText !== undefined) {
			tests.push(currentTest);
			currentTest = {};
		}

		currentTest[blockType] = blockContent.join('\n').slice(0, -1); // ?
		blockContent = [];
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith('//')) {
			continue;
		}

		if (line.startsWith('previousText:')) {
			finishBlock();
			blockType = 'previousText';
			continue;
		}

		if (line.startsWith('edits:')) {
			finishBlock();
			blockType = 'edits';
			continue;
		}

		if (line.startsWith('nextText:')) {
			finishBlock();
			blockType = 'nextText';
			continue;
		}

		if (line.startsWith('expectedDom:')) {
			finishBlock();
			blockType = 'expectedDom';
			continue;
		}

		blockContent.push(line);
	}

	finishBlock();
	blockType = 'previousText';
	finishBlock();

	const e2eCases = tests.map(test => {
		const {previousText} = test;
		validatePreviousText(previousText);
		const {nextText} = test;
		validateNextText(nextText);
		const edits = parseJson(test.edits);
		validateEdits(edits);
		const {expectedDom} = test;
		validateExpectedDom(expectedDom);
		validateTestCase({previousText, nextText, edits}, fileName);
		return {previousText, edits, expectedDom};
	});

	e2eCases;

	const code = generateTestCase({fileName, testCases: e2eCases});

	if (!fs.existsSync(path.join(__dirname, 'generated-tests'))) {
		fs.mkdirSync(path.join(__dirname, 'generated-tests'));
	}

	fs.writeFileSync(
		path.join(__dirname, `generated-tests/${fileName.replace(/\.txt$/, '.ts')}`),
		code
	);
}

for (const testFileName of testFileNames) {
	gen(testFileName);
}
