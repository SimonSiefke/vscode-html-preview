/**
 *
 * @param {{fileName:string,testCases:any[]}} options
 */
function generateTestCase({fileName, testCases}) {
	const testCaseName = fileName.replace(/\.test\.txt$/, '');
	return `import {
  TestCase,
  createTestFile,
  activateExtension,
  closeTestFile,
  setText,
  setCursorPosition,
  type,
} from '../test-util'
import {before, after} from 'mocha'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'

let browser: puppeteer.Browser
let page: puppeteer.Page
const headless = false

let uri: vscode.Uri
before(async () => {
  uri = await createTestFile('${testCaseName}.html')
  await setText(${testCases[0].previousDom})
  await activateExtension()
  browser = await puppeteer.launch({headless, args: ['--no-sandbox']})
  page = await browser.newPage()
})

after(async () => {
  await browser.close()
})

test('${testCaseName}', async () => {
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000')
  const edit = ${testCases[0].edit}
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
  vscode.workspace.applyEdit(vscodeEdit)
  const html = await page.content()
  console.log(html)
  await new Promise(resolve => {})
})
`;
}

generateTestCase({
	fileName: 'basic.test.txt',
	testCases: [
		{
			previousText: '',
			edit: {},
			expectedDom: ''
		}
	]
}); // ?
