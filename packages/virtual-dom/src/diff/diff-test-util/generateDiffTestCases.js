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

	if ((blockType === 'name' || blockType === 'previousDom') && currentTest.previousDom) {
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

	if (line.startsWith('previousDom:')) {
		finishBlock();
		blockType = 'previousDom';
		continue;
	}

	if (line.startsWith('edits:')) {
		finishBlock();
		blockType = 'edits';
		continue;
	}

	if (line.startsWith('nextDom:')) {
		finishBlock();
		blockType = 'nextDom';
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
blockType = 'previousDom';
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

function validatePreviousDom(previousDom) {
	return typeof previousDom === 'string';
}

function validateNextDom(nextDom) {
	return typeof nextDom === 'string';
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
			expectedNextCode[index] = testCase.previousDom[index];
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
	while (index < testCase.previousDom.length) {
		index;
		expectedNextCode[index + inserted] = testCase.previousDom[index];
		index++;
	}

	if (expectedNextCode.join('') !== testCase.nextDom) {
		f;
		testCase.name; // ?
		console.log(expectedNextCode.join('')); // ?
		console.log(testCase.nextDom); // ?
		const en = expectedNextCode.join('');
		for (let n = 0; n < en.length; n++) {
			if (en[n] !== testCase.nextDom[n]) {
				console.log('\nindex is', n);
				console.log(
					'expected',
					en
						.slice(n, n + 10)
						.replace(/ /g, 'SPACE')
						.replace(/\n/g, 'NEWLINE'),
					'\ngot',
					testCase.nextDom
						.slice(n, n + 10)
						.replace(/ /g, 'SPACE')
						.replace(/\n/g, 'NEWLINE')
				);
				break;
			}
		}

		throw new Error(
			`testcase ${f} "${testCase.name}" is invalid, nextdom does not match specified edit`
		);
	}
}

for (const test of tests) {
	if (tests.filter(t => t.name === test.name).length >= 2) {
		throw new Error(`test with name "${test.name}" exists twice`);
	}
}

const jestCases = tests.map(test => {
	const {previousDom} = test;
	validatePreviousDom(previousDom);
	const {nextDom} = test;
	validateNextDom(nextDom);
	const edits = parseJson(test.edits);
	validateEdits(edits);
	const expectedEdits = parseJson(test.expectedEdits);
	validateExpectedEdits(expectedEdits);
	const {name} = test;
	validateName(name);
	validateTestCase({previousDom, nextDom, edits, name});
	return `test(\`${name || nextDom}\`, () => {
  const parser = createParser()
  const previousDom = parser.parse(\`${previousDom}\`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(\`${nextDom}\`, ${JSON.stringify(edits, null, 2)
	.split('\n')
	.map((x, index) => (index === 0 ? x : '  ' + x))
	.join('\n')})
  const newNodeMap = parser.nodeMap
  const edits = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap})
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
