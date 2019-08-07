import * as fs from 'fs';
import * as path from 'path';

const genDomTest = fs.readFileSync(path.join(__dirname, '../genDom.test.txt'), 'utf-8');

const lines = genDomTest.split('\n');

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

	if ((blockType === 'name' || blockType === 'input') && currentTest.input) {
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

	if (line.startsWith('input:')) {
		finishBlock();
		blockType = 'input';
		continue;
	}

	if (line.startsWith('expectedOutput:')) {
		finishBlock();
		blockType = 'expectedOutput';
		continue;
	}

	blockContent.push(line);
}

finishBlock();
blockType = 'input';
finishBlock();

function validateInput(input) {
	return typeof input === 'string';
}

function validateExpectedOutput(expectedOutput) {
	return typeof expectedOutput === 'string';
}

function validateName(name) {
	return name && typeof name === 'string';
}

const jestCases = tests.map(test => {
	let {input} = test;
	validateInput(input);
	input = input.replace(/`/g, '\\`');
	let {expectedOutput} = test;
	validateExpectedOutput(expectedOutput);
	expectedOutput = expectedOutput.replace(/`/g, '\\`');
	const {name} = test;
	validateName(name);
	return `test(\`${name || expectedOutput}\`, () => {
  const output = genDom(\`${input}\`)
  const expectedOutput = \`${expectedOutput}\`
  expect(output).toBe(expectedOutput)
})`; // ?
});

const importCode = ['import { genDom } from \'../genDom\''].join('\n');

const jestCasesCode = jestCases.join('\n\n'); // ?

const code = `${importCode}\n\n${jestCasesCode}`;

fs.writeFileSync(path.join(__dirname, 'genDom.generated.test.ts'), code);

console.log('generated genDom tests ✔️');
