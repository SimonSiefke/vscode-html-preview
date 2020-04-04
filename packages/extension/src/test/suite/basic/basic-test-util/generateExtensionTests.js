const fs = require('fs-extra')
const path = require('path')
const { toJson } = require('really-relaxed-json')
const { validate } = require('jsonschema')

const headless = true

// TODO
const failingTests = [
  'replace-element-with-text.test.txt',
  'delete-first-element-node.test.txt',
  'delete-element-before-element.test.txt',
  'delete-text-before-text.test.txt',
  'delete-text-after-element.test.txt',
  'delete-element-before-text.test.txt',
  'delete-020-delete-text-between-comment-and-text.test.txt',
  'delete-021-delete-text-between-comment-and-element.test.txt',
  'delete-100-delete-element-between-text-and-text.test.txt',
  'delete-110-delete-element-between-element-and-text.test.txt',
  'delete-111-delete-element-between-element-and-element.test.txt',
  'delete-112-delete-element-between-element-and-comment.test.txt',
  'delete-120-delete-element-between-comment-and-text.test.txt',
  'delete-121-delete-element-between-comment-and-element.test.txt',
  'delete-122-delete-element-between-comment-and-comment.test.txt',
  'delete-200-delete-comment-between-text-and-text.test.txt',
  'delete-210=delete-comment-between-element-and-text.test.txt',
  'delete-211-delete-comment-between-element-and-element.test.txt',
  'delete-212-delete-comment-between-element-and-comment.test.txt',
  'delete-220-delete-comment-between-comment-and-text.test.txt',
  'delete-221-delete-comment-between-comment-and-element.test.txt',
  'delete-222-delete-comment-between-comment-and-comment.test.txt',
  'insert-010-insert-text-between-element-and-text.test.txt',
  'insert-011-insert-text-between-element-and-element.test.txt',
  'insert-012-insert-text-between-element-and-comment.test.txt',
  'insert-020-insert-text-between-comment-and-text.test.txt',
  'insert-021-insert-text-between-comment-and-element.test.txt',
  'insert-022-insert-text-between-comment-and-comment.test.txt',
  'special-1-delete-html-with-content.test.txt',
  'bug-1.test.txt',
  'bug-13.test.txt',
  'bug-7.test.txt',
  'bug-8.test.txt',
  'comment-before-style.test.txt',
  'dynamic-html-1.test.txt',
  'element-before-head.test.txt',
  'element-node-before-style.test.txt',
  'invalid-1.test.txt',
  'textnode-before-head.test.txt',
  'textnode-before-style.test.txt',
  'textnode-inserted-after-head.test.txt',
  'top-122-implicit-html-explicit-head-explicit-body.test.txt',
  'whitespace-before-head.test.txt',
  'whitespace-before-implicit-head.test.txt',
  'insert-doctype.test.txt',
  'top-100-implicit-html-no-head-no-body.test.txt',
  'top-101-implicit-html-no-head-implicit-body.test.txt',
  'top-102-implicit-html-no-head-explicit-body.test.txt',
  'top-110-implicit-html-implicit-head-no-body.test.txt',
  'top-111-implicit-html-implicit-head-implicit-body.test.txt',
  'top-112-implicit-html-implicit-head-explicit-body.test.txt',
  'top-120-implicit-html-explicit-head-no-body.test.txt',
  'top-121-implicit-html-explicit-head-implicit-body.test.txt',
  'top-122-implicit-html-explicit-head-explicit-body.test.txt',
  'top-200-explicit-html-no-head-no-body.test.txt',
  'top-201-explicit-html-no-head-implicit-body.test.txt',
  'top-202-explicit-html-no-head-explicit-body.test.txt',
  'top-210-explicit-html-implicit-head-no-body.test.txt',
  'top-211-explicit-html-implicit-head-implicit-body.test.txt',
  'top-212-explicit-html-implicit-head-explicit-body.test.txt',
  'top-220-explicit-html-explicit-head-no-body.test.txt',
  'top-221-explicit-html-explicit-head-implicit-body.test.txt',
  'top-222-explicit-html-explicit-head-explicit-body.test.txt',
]

const only = []
const testFileNames = fs
  .readdirSync(path.join(__dirname, '..'))
  .filter(file => file.endsWith('.test.txt'))
  .filter(x => !failingTests.includes(x))
  .filter(x => (only.length > 0 ? only.includes(x) : true))

testFileNames.length // ?
// fs.removeSync(path.join(__dirname, 'generated-tests'));
fs.ensureDirSync(path.join(__dirname, 'generated-tests'))

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
`

function genSingle(testCase) {
  const edit = testCase.edits[0]
  const { waitForEdits, waitForReload } = testCase // ?
  const createEdit = `	const edit = ${JSON.stringify(edit, null, 2)}
  const vscodeEdit = new vscode.WorkspaceEdit()
  const {document} = vscode.window.activeTextEditor
  vscodeEdit.replace(
    uri,
    new vscode.Range(
      document.positionAt(edit.rangeOffset),
      document.positionAt(edit.rangeOffset + edit.rangeLength)
    ),
    edit.text
  )`
  const applyEdit = `await vscode.workspace.applyEdit(vscodeEdit)`
  return `
	{
    ${
      waitForReload
        ? `${createEdit}\n${applyEdit}\nawait page.waitForNavigation({ waitUntil: 'networkidle2' })\n`
        : ''
    }
    ${
      waitForEdits
        ? `${createEdit}\nwaitForUpdateStart(page)\n${applyEdit}\nawait waitForUpdateEnd(page)`
        : ''
    }
    ${!waitForEdits && !waitForReload ? `await new Promise(resolve=>setTimeout(resolve, 100))` : ''}
	const html = await page.content()
	assert.equal(adjust(html), \`${testCase.expectedDom}\`);
	
		}`
}

/**
 *
 * @param {{fileName:string,testCases:any[]}} options
 */
function generateTestCase({ fileName, testCases }) {
  const testCaseName = fileName.replace(/\.test\.txt$/, '')
  const singles = testCases.map(genSingle)
  if (!testCases[0]) {
    throw new Error(`${fileName} must contain one test case`)
  }

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
	return new Promise((resolve, reject)=>{
		setTimeout(() => {
			reject(new Error('no update received'));
		}, 50);
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
	return html.replace(/ data-id="\\d*"/g, '');
}

test('${testCaseName}', async () => {
	const uri = await createTestFile('${testCaseName}.html')
  await setText(\`${testCases[0].previousText}\`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000/${testCaseName}.html', {waitUntil: 'load', timeout: 15000})
  //await page.goto('http://localhost:3000/${testCaseName}.html')
	${singles.join('\n')}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
`
}

function parseJson(json) {
  try {
    return JSON.parse(toJson(json))
  } catch (error) {
    throw new Error('invalid json' + json)
  }
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

function validateExpectedDom(expectedDom) {
  return typeof expectedDom === 'string'
}

function validateTestCase(testCase, testCaseName) {
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
            .slice(n, n + 20)
            .replace(/ /g, 'SPACE')
            .replace(/\n/g, 'NEWLINE'),
          '\ngot',
          testCase.nextText
            .slice(n, n + 20)
            .replace(/\t/g, 'TAB')
            .replace(/ /g, 'SPACE')
            .replace(/\n/g, 'NEWLINE')
        )
        break
      }
    }

    throw new Error(`testcase ${testCaseName} is invalid, nextdom does not match specified edit`)
  }
}

function validateWaitForEdits(waitForEdits) {
  return waitForEdits === 'false'
}

function validateWaitForReload(waitForReload) {
  return waitForReload === 'true'
}

function gen(fileName) {
  const basicTest = fs.readFileSync(path.join(__dirname, `../${fileName}`), 'utf-8')

  const lines = basicTest.split('\n')

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

    if (blockType === 'previousText' && currentTest.previousText !== undefined) {
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

    if (line.startsWith('previousText:')) {
      finishBlock()
      blockType = 'previousText'
      continue
    }

    if (line.startsWith('waitForReload:')) {
      finishBlock()
      blockType = 'waitForReload'
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

    if (line.startsWith('expectedDom:')) {
      finishBlock()
      blockType = 'expectedDom'
      continue
    }

    if (line.startsWith('waitForEdits:')) {
      finishBlock()
      blockType = 'waitForEdits'
      continue
    }

    blockContent.push(line)
  }

  finishBlock()
  blockType = 'previousText'
  finishBlock()

  const e2eCases = tests.map(test => {
    if (test.waitForEdits) {
      validateWaitForEdits(test.waitForEdits)
    }

    if (test.waitForReload) {
      validateWaitForReload(test.waitForReload)
    }

    const waitForEdits = test.waitForEdits !== 'false' && test.waitForReload !== 'true'
    const { previousText } = test
    const waitForReload = test.waitForReload === 'true'
    validatePreviousText(previousText)
    const { nextText } = test
    validateNextText(nextText)
    const edits = parseJson(test.edits)
    validateEdits(edits)
    const { expectedDom } = test
    validateExpectedDom(expectedDom)
    validateTestCase({ previousText, nextText, edits }, fileName)
    return { previousText, edits, expectedDom, waitForEdits, waitForReload }
  })

  e2eCases

  const code = generateTestCase({ fileName, testCases: e2eCases })

  if (!fs.existsSync(path.join(__dirname, 'generated-tests'))) {
    fs.mkdirSync(path.join(__dirname, 'generated-tests'))
  }

  fs.writeFileSync(
    path.join(__dirname, `generated-tests/${fileName.replace(/\.txt$/, '.ts')}`),
    code
  )
}

for (const testFileName of testFileNames) {
  try {
    gen(testFileName)
  } catch (error) {
    testFileName
    throw error
  }
}
