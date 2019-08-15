import * as fs from 'fs';
import * as path from 'path';
import {toJson} from 'really-relaxed-json';
import {validate} from 'jsonschema';

const diffTest = fs.readFileSync(path.join(__dirname, '../diff.test.txt'), 'utf-8');

const lines = diffTest.split('\n');

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

	if ((blockType === 'name' || blockType === 'previousText') && currentTest.previousText) {
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

	if (line.startsWith('name:')) {
		finishBlock();
		blockType = 'name';
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

	if (line.startsWith('expectedEdits:')) {
		finishBlock();
		blockType = 'expectedEdits';
		continue;
	}

	blockContent.push(line);
}

finishBlock();
blockType = 'previousText';
finishBlock();

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

const expectedEditsSchema = {
	type: 'array',
	items: {
		type: 'object',
		additionalProperties: false,
		properties: {
			command: {
				type: 'string',
				enum: [
					'elementInsert',
					'textReplace',
					'attributeAdd',
					'elementDelete',
					'attributeChange',
					'attributeDelete'
				]
			},
			payload: {
				type: 'object'
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

function validateExpectedEdits(expectedEdits) {
	const result = validate(expectedEdits, expectedEditsSchema); // ?
	if (result.errors.length > 0) {
		throw new Error(JSON.stringify(result.errors, null, 2));
	}
}

function validateName(name) {
	return name === undefined || typeof name === 'string';
}

let f = 0;
function validateTestCase(testCase) {
	f++;
	if (f !== 45) {
		// return;
	}

	const expectedNextCode = [];
	let index = 0;
	let deleted = 0;
	let inserted = 0;
	for (const edit of testCase.edits) {
		while (index < edit.rangeOffset) {
			expectedNextCode[index] = testCase.previousText[index];
			index++;
		}

		index += edit.rangeLength;
		deleted += edit.rangeLength;
		inserted += edit.text.length;
		for (let j = 0; j < edit.text.length; j++) {
			expectedNextCode[index + j] = edit.text[j];
			expectedNextCode.join(''); // ?
		}
	}

	expectedNextCode.join(''); // ?

	index;
	while (index < testCase.previousText.length) {
		index;
		expectedNextCode[index + inserted] = testCase.previousText[index];
		index++;
	}

	if (expectedNextCode.join('') !== testCase.nextText) {
		f;
		testCase.name; // ?
		console.log(expectedNextCode.join('')); // ?
		console.log(testCase.nextText); // ?
		const en = expectedNextCode.join('');
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

		throw new Error(
			`testcase ${f} "${testCase.name}" is invalid, nextText does not match specified edit`
		);
	}
}

for (const test of tests) {
	if (tests.filter(t => t.name === test.name).length >= 2) {
		throw new Error(`test with name "${test.name}" exists twice`);
	}
}

const jestCases = tests.map(test => {
	const {previousText} = test;
	validatePreviousText(previousText);
	const {nextText} = test;
	validateNextText(nextText);
	const edits = parseJson(test.edits);
	validateEdits(edits);
	const expectedEdits = parseJson(test.expectedEdits);
	validateExpectedEdits(expectedEdits);
	const {name} = test;
	validateName(name);
	validateTestCase({previousText, nextText, edits, name});
	return `test(\`${name || nextText}\`, () => {
  const parser = createParser()
  const previousText = parser.parse(\`${previousText}\`)
  const oldNodeMap = parser.nodeMap
  const nextText = parser.edit(\`${nextText}\`, ${JSON.stringify(edits, null, 2)
	.split('\n')
	.map((x, index) => (index === 0 ? x : '  ' + x))
	.join('\n')})
  const newNodeMap = parser.nodeMap
  const edits = diff(previousText.children, nextText.children, {oldNodeMap, newNodeMap})
  const expectedEdits = ${JSON.stringify(expectedEdits, null, 2)
		.split('\n')
		.map((x, index) => (index === 0 ? x : '  ' + x))
		.join('\n')}
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})`; // ?
});

const importCode = [
	'import { diff } from \'../diff\'',
	'import { createParser } from \'../../parse/parse\''
].join('\n');
const functionCode = [
	`function adjustEdits(edits){
  for(const edit of edits){
    delete edit.payload.id
    delete edit.payload.index
		delete edit.payload.parentId
  }
  return edits
}`,
	`function adjustExpectedEdits(expectedEdits){
  for(const expectedEdit of expectedEdits){
    if(expectedEdit.command==='elementInsert' && expectedEdit.payload.nodeType==='ElementNode'){
      expectedEdit.payload.attributes = expectedEdit.payload.attributes||{}
    }
  }
  return expectedEdits
}`
].join('\n\n');

const jestCasesCode = jestCases.join('\n\n'); // ?

const code = `${importCode}\n\n${functionCode}\n\n${jestCasesCode}`;

fs.writeFileSync(path.join(__dirname, 'diff.generated.test.ts'), code);

console.log('generated diff tests ✔️');
