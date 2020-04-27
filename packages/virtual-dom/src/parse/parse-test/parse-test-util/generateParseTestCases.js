import * as fs from 'fs'
import * as path from 'path'
import { toJson } from 'really-relaxed-json'
import { validate } from 'jsonschema'

const failing = ['angle-bracket-in-quoted-attribute.test.txt', 'base.test.txt']
const testFileNames = [
  'invalid-or-missing-closing-tag.test.txt',
  'angle-bracket-in-quoted-attribute.test.txt',
  'self-closing-tag.test.txt',
  'single-angle-bracket.test.txt',
  'invalid-or-missing-start-tag.test.txt',
  'empty-fragment.test.txt',
  'comment.test.txt',
  'html5-boilerplate.test.txt',
].filter(x => !failing.includes(x))

testFileNames.forEach(generateTest)

function parseJson(json) {
  return JSON.parse(toJson(json))
}

function generateTest(fileName) {
  const file = fs.readFileSync(path.join(__dirname, '..', fileName), 'utf-8')
  const lines = file.split('\n')

  if (lines[lines.length - 1] !== '') {
    throw new Error('file must end with a new line')
  }

  let currentTest = {}
  const tests = []

  let blockType
  let blockContent = []
  function finishBlock() {
    if (!blockType) {
      return
    }

    if (blockType === 'name' && currentTest.text) {
      tests.push(currentTest)
      currentTest = {}
    }

    currentTest[blockType] = blockContent.join('\n').slice(0, -1) // ?
    blockContent = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('//')) {
      continue
    }

    if (line.startsWith('name:')) {
      finishBlock()
      blockType = 'name'
      continue
    }

    if (line.startsWith('text:')) {
      finishBlock()
      blockType = 'text'
      continue
    }

    if (line.startsWith('error:')) {
      finishBlock()
      blockType = 'error'
      continue
    }

    if (line.startsWith('expectedTree:')) {
      finishBlock()
      blockType = 'expectedTree'
      continue
    }

    blockContent.push(line)
  }

  finishBlock()
  blockType = 'name'
  finishBlock()
  jestCases(tests, fileName)
}

// for (const test of tests) {
// 	if (tests.filter(t => t.name === test.name).length >= 2) {
// 		throw new Error(`test with name "${test.name}" exists twice`);
// 	}
// }

function validateText(previousText) {
  return typeof previousText === 'string'
}

function validateError(error) {
  const errorSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      type: {
        type: 'string',
        enum: ['invalid', 'soft-invalid'],
      },
      message: {
        type: 'string',
      },
      offset: {
        type: 'number',
      },
    },
  }
  const result = validate(error, errorSchema)
  if (result.errors.length > 0) {
    throw new Error(JSON.stringify(result.errors, null, 2))
  }
}

function validateExpectedTree(expectedTree) {}

function validateName(name) {
  return typeof name === 'string'
}

function jestCases(tests, fileName) {
  const jestCasesCode = []
  for (const test of tests) {
    const jestCaseCode = jestCase(test)
    jestCasesCode.push(jestCaseCode)
  }

  const importCode = ["import { parseHtml } from '../../../parse'"].join('\n')

  const functionCode = `
	function adjustHtmlDocument(htmlDocument){
		if(!htmlDocument){
			return null
		}
		if(Array.isArray(htmlDocument)){
			return htmlDocument.map(adjustHtmlDocument)
		}
		delete htmlDocument.id
		delete htmlDocument.start
		delete htmlDocument.childSignature
		delete htmlDocument.attributeSignature
		delete htmlDocument.subtreeSignature
		delete htmlDocument.textSignature
		delete htmlDocument.closed
		delete htmlDocument.parent
		if(htmlDocument.nodeType==="ElementNode"){
			htmlDocument.children = htmlDocument.children.map(adjustHtmlDocument)
		}
		return htmlDocument
	}
	function adjustExpectedTree(expectedTree){
		if(!expectedTree){
			return expectedTree
		}
		if(Array.isArray(expectedTree)){
			return expectedTree.map(adjustExpectedTree)
		}
		if(expectedTree.nodeType==="ElementNode" && !expectedTree.attributes){
			expectedTree.attributes = {}
		}
		if(expectedTree.nodeType==="ElementNode" && !expectedTree.children){
			expectedTree.children = []
		}
		if(expectedTree.nodeType==="ElementNode"){
			expectedTree.children = expectedTree.children.map(adjustExpectedTree)
		}
		return expectedTree
	}
	`
  const code = `${importCode}\n\n${functionCode}\n\n${jestCasesCode.join('\n\n')}`
  if (!fs.existsSync(path.join(__dirname, 'generated-tests'))) {
    fs.mkdirSync(path.join(__dirname, 'generated-tests'))
  }

  fs.writeFileSync(
    path.join(__dirname, 'generated-tests', `${fileName.replace('.txt', '.ts')}`),
    code
  )
}

function jestCase(test) {
  const text = test.text.replace(/\\/g, '\\\\') // need to escape single backslash
  validateText(text)

  const error = parseJson(test.error || 'null')
  if (error !== null) {
    validateError(error)
  }

  const { name } = test
  validateName(name)
  const expectedTree = parseJson(test.expectedTree || 'null')
  if (expectedTree) {
    validateExpectedTree(expectedTree)
  }

  const skip = name.startsWith('skip')
  return `test${skip ? '.skip' : ''}(\`${skip ? name.slice(5) : name}\`, () => {
  const {error, htmlDocument} = parseHtml(\`${text}\`)
	const expectedError = ${JSON.stringify(error, null, 2)
    .split('\n')
    .map((line, index) => (index ? '  ' + line : line))
    .join('\n')}
		expect(error).toEqual(expectedError)
	const expectedTree = ${JSON.stringify(expectedTree, null, 2)}
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})` // ?
}

console.log('generated parser tests ✔️')
