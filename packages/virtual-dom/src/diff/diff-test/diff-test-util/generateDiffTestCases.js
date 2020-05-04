const fs = require('fs-extra')
const path = require('path')
const { toJson } = require('really-relaxed-json')
const { validate } = require('jsonschema')
const failingTests = [
  'move-down.test.txt',
  'delete-022-delete-text-between-comment-and-comment.test.txt',
  'delete-122-delete-element-between-comment-and-comment.test.txt',
  'deleting-an-attribute-character-by-character.test.txt',
  'move-up.test.txt',
]

const only = []
const diffTestFiles = fs
  .readdirSync(path.join(__dirname, '..'))
  .filter(file => file.endsWith('.test.txt'))
  .filter(x => !failingTests.includes(x))
  .filter(x => (only.length > 0 ? only.includes(x) : true))

// fs.removeSync(path.join(__dirname, 'generated-tests'));
fs.ensureDirSync(path.join(__dirname, 'generated-tests'))

diffTestFiles.forEach(generateTest)

function generateTest(fileName) {
  const testFile = fs.readFileSync(path.join(__dirname, '..', fileName), 'utf-8')

  const lines = testFile.split('\n')

  if (lines[lines.length - 1] !== '') {
    throw new Error(`file ${fileName} must end with a new line`)
  }

  let currentTest = {}
  const tests = []

  let blockType
  let blockContent = []
  function finishBlock() {
    if (!blockType) {
      return
    }

    if (
      (blockType === 'name' || blockType === 'previousText') &&
      currentTest.previousText !== undefined
    ) {
      tests.push(currentTest)
      currentTest = {}
    }

    currentTest[blockType] = blockContent.join('\n').slice(0, -1)
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

    if (line.startsWith('previousText:')) {
      finishBlock()
      blockType = 'previousText'
      continue
    }

    if (line.startsWith('initialError:')) {
      finishBlock()
      blockType = 'initialError'
      continue
    }

    if (line.startsWith('error:')) {
      finishBlock()
      blockType = 'error'
      continue
    }

    if (line.startsWith('edits:')) {
      finishBlock()
      blockType = 'edits'
      continue
    }

    if (line.startsWith('nextText:')) {
      finishBlock()
      blockType = 'nextText'
      continue
    }

    if (line.startsWith('expectedEdits:')) {
      finishBlock()
      blockType = 'expectedEdits'
      continue
    }

    blockContent.push(line)
  }

  finishBlock()
  blockType = 'name'
  finishBlock()

  function parseJson(json) {
    return JSON.parse(toJson(json))
  }

  const editsSchema = {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      properties: {
        rangeLength: {
          type: 'number',
        },
        rangeOffset: {
          type: 'number',
        },
        text: {
          type: 'string',
        },
      },
    },
  }

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
            'attributeDelete',
            'elementMove',
          ],
        },
        payload: {
          type: 'object',
        },
      },
    },
  }

  function validatePreviousText(previousText) {
    return typeof previousText === 'string'
  }

  function validateNextText(nextText) {
    return typeof nextText === 'string'
  }

  function validateEdits(edits) {
    const result = validate(edits, editsSchema) // ?
    if (result.errors.length > 0) {
      throw new Error(JSON.stringify(result.errors, null, 2))
    }
  }

  function validateExpectedEdits(expectedEdits) {
    const result = validate(expectedEdits, expectedEditsSchema) // ?
    if (result.errors.length > 0) {
      throw new Error(JSON.stringify(result.errors, null, 2))
    }
  }

  function validateTestCase(testCase, fileName) {
    const expectedNextCode = []
    let newIndex = 0
    testCase.edits = testCase.edits.sort((a, b) => a.rangeOffset - b.rangeOffset)
    for (const edit of testCase.edits) {
      while (newIndex < edit.rangeOffset) {
        expectedNextCode.push(testCase.previousText[newIndex])
        newIndex++
      }

      newIndex += edit.rangeLength

      for (let j = 0; j < edit.text.length; j++) {
        expectedNextCode.push(edit.text[j])
      }
    }

    while (newIndex < testCase.previousText.length) {
      expectedNextCode.push(testCase.previousText[newIndex])
      newIndex++
    }

    expectedNextCode.join('') // ?

    if (expectedNextCode.join('') !== testCase.nextText) {
      console.log(expectedNextCode.join('')) // ?
      console.log(testCase.nextText) // ?
      const en = expectedNextCode.join('')
      for (let n = 0; n < en.length; n++) {
        if (en[n] !== testCase.nextText[n]) {
          console.log('\nindex is', n)
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
          )
          break
        }
      }

      throw new Error(`testcase ${fileName} is invalid, nextText does not match specified edit`)
    }
  }

  // for (const test of tests) {
  // 	if (tests.filter(t => t.name === test.name).length >= 2) {
  // 		throw new Error(`test with name "${test.name}" exists twice`);
  // 	}
  // }

  const test = tests[0]
  const { previousText } = test
  validatePreviousText(previousText)
  const { nextText } = test
  validateNextText(nextText)
  const edits = parseJson(test.edits)
  validateEdits(edits)
  const expectedEdits = parseJson(test.expectedEdits || '[]')
  validateExpectedEdits(expectedEdits)
  validateTestCase({ previousText, nextText, edits }, fileName)

  const outer = `test(\`${fileName}\`, () => {
  let offsetMap = Object.create(null)

  let id = 0
  const p1 = parse(\`${previousText}\`, offset => {
    const nextId = id++
    offsetMap[offset] = nextId
    return nextId
  })

  offsetMap = updateOffsetMap(offsetMap, ${JSON.stringify(edits, null, 2)
    .split('\n')
    .map(l => `  ${l}`)
    .join('\n')
    .trimLeft()})

  let newOffsetMap = Object.create(null)

  const p2 = parse(\`${nextText}\`, (offset, tokenLength) => {
    let nextId: number
    nextId: if (offset in offsetMap) {
      nextId = offsetMap[offset]
    } else {
      for (let i = offset + 1; i < offset + tokenLength; i++) {
        if (i in offsetMap) {
          nextId = offsetMap[i]
          break nextId
        }
      }
      nextId = id++
    }
    newOffsetMap[offset] = nextId
    return nextId
  })
  if(p1.status === 'success' && p2.status === 'success'){
    const edits = diff(p1, p2)
    const expectedEdits = ${JSON.stringify(expectedEdits, null, 2)
      .split('\n')
      .map(l => `    ${l}`)
      .join('\n')
      .trimLeft()}
    expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
  }
})`

  // assert.equal(tests.length, 1)

  const importCode = [
    "import { diff } from '../../../diff2'",
    "import { parse } from '../../../../parse/parse2'",
    "import { updateOffsetMap } from '../../../../parse/updateOffsetMap'",
  ].join('\n')
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
}`,
  ].join('\n\n')
  const code = `${importCode}\n\n${functionCode}\n\n${outer}`

  fs.writeFileSync(path.join(__dirname, 'generated-tests', fileName.replace('.txt', '.ts')), code)
}

console.log('generated diff tests ✔️')
