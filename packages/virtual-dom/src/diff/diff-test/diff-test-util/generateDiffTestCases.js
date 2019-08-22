import * as fs from 'fs-extra';
import * as path from 'path';
import {toJson} from 'really-relaxed-json';
import {validate} from 'jsonschema';

const failingTests = [
	'attribute-change-1.test.txt',
	'attribute-change-2.test.txt',
	'insertion-of-attribute-with-value.test.txt',
	'insertion-of-multiple-elements-and-text-nodes.test.txt',
	'attribute-value-insertion-at-the-end.test.txt',
	'attribute-value-replacement.test.txt',
	'adding-body-tag-into-document.test.txt',
	'adding-head-into-document.test.txt',
	'deleting-an-attribute-character-by-character.test.txt',
	'deleting-empty-tag-character-by-character.test.txt',
	'deleting-non-empty-tag-character-by-character.test.txt',
	'insert-h1-character-by-character.test.txt',
	'pasting-tag-over-multiple-tags-and-text.test.txt',
	'simple-tag-insert.test.txt must end with a new line',
	'simple-tag-insert.test.txt',
	'tag-changes-with-child-element.test.txt',
	'typing-of-a-new-attribute-character-by-character.test.txt',
	'wrapping-a-tag-around-some-text-character-by-character.test.txt',
	'void-element-tag-changes.test.txt',
	'diff.test.txt',
	'deleting-non-empty-tag-character-by-character.test.txt',
	'doctype-and-whitespace-2.test.txt',
	'doctype-and-whitespace-1.test.txt',
	'doctype-and-whitespace-3.test.txt',
	'bug-2.test.txt',
	'replace-text-after-element-and-insert-element.test.txt'
];

const diffTestFiles = fs
	.readdirSync(path.join(__dirname, '..'))
	.filter(file => file.endsWith('.test.txt'))
	.filter(x => !failingTests.includes(x));

// fs.removeSync(path.join(__dirname, 'generated-tests'));
fs.ensureDirSync(path.join(__dirname, 'generated-tests'));

diffTestFiles.forEach(generateTest);

function generateTest(fileName) {
	const testFile = fs.readFileSync(path.join(__dirname, '..', fileName), 'utf-8');

	const lines = testFile.split('\n');

	if (lines[lines.length - 1] !== '') {
		throw new Error(`file ${fileName} must end with a new line`);
	}

	let currentTest = {};
	const tests = [];

	let blockType;
	let blockContent = [];
	function finishBlock() {
		if (!blockType) {
			return;
		}

		if (
			(blockType === 'name' || blockType === 'previousText') &&
			currentTest.previousText !== undefined
		) {
			tests.push(currentTest);
			currentTest = {};
		}

		currentTest[blockType] = blockContent.join('\n').slice(0, -1);
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

		if (line.startsWith('error:')) {
			finishBlock();
			blockType = 'error';
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
	blockType = 'name';
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

	function validateTestCase(testCase, fileName) {
		const expectedNextCode = [];
		let index = 0;
		let inserted = 0;
		for (const edit of testCase.edits) {
			while (index < edit.rangeOffset) {
				expectedNextCode[index] = testCase.previousText[index];
				index++;
			}

			testCase.previousText.split(''); // ?
			expectedNextCode; // ?
			index += edit.rangeLength;
			inserted += edit.text.length;
			for (let j = 0; j < edit.text.length; j++) {
				expectedNextCode[index + j] = edit.text[j];
				expectedNextCode.join(''); // ?
			}
		}

		expectedNextCode.join(''); // ?

		while (index < testCase.previousText.length) {
			expectedNextCode[index + inserted] = testCase.previousText[index];
			index++;
		}

		if (expectedNextCode.join('') !== testCase.nextText) {
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

			throw new Error(`testcase ${fileName} is invalid, nextText does not match specified edit`);
		}
	}

	// for (const test of tests) {
	// 	if (tests.filter(t => t.name === test.name).length >= 2) {
	// 		throw new Error(`test with name "${test.name}" exists twice`);
	// 	}
	// }

	const outer = inner => `test(\`${fileName}\`, () => {
	const parser = createParser()
	let previousDom
	${inner.map(x => `  {\n${x}\n  }`).join('\n')}
})`;

	const inners = tests.map((test, testIndex) => {
		const {previousText} = test;
		validatePreviousText(previousText);
		const {nextText} = test;
		validateNextText(nextText);
		const edits = parseJson(test.edits);
		validateEdits(edits);
		const expectedEdits = parseJson(test.expectedEdits || '[]');
		validateExpectedEdits(expectedEdits);
		validateTestCase({previousText, nextText, edits}, fileName);
		return `

  ${
	testIndex === 0 && !tests[0].error ?
		'previousDom = parser.parse(' + JSON.stringify(previousText) + ').htmlDocument' :
		''
}
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(\`${nextText}\`, ${JSON.stringify(
	edits,
	null,
	2
)
	.split('\n')
	.map((x, index) => (index === 0 ? x : '  ' + x))
	.join('\n')})
	const expectedError = ${test.error};
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = ${JSON.stringify(expectedEdits, null, 2)
		.split('\n')
		.map((x, index) => (index === 0 ? x : '  ' + x))
		.join('\n')}
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	`; // ?
	});
	const outerCode = outer(inners);

	const importCode = [
		'import { diff } from \'../../../diff\'',
		'import { createParser } from \'../../../../parse/parse\''
	].join('\n');
	const functionCode = [
		`function adjustEdits(edits){
  for(const edit of edits){
    delete edit.payload.index
    delete edit.payload.beforeId
    delete edit.payload.id
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
	const code = `${importCode}\n\n${functionCode}\n\n${outerCode}`;

	fs.writeFileSync(path.join(__dirname, 'generated-tests', fileName.replace('.txt', '.ts')), code);
}

console.log('generated diff tests ✔️');
