
import {
  createTestFile,
  activateExtension,
  setText,
} from '../../../../test-util'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'

const headless = false

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
	return html.replace('\n<script type="module" src="html-preview.js"></script>', '').replace('<script type="module" src="html-preview.js"></script>', '').replace(/ data-id="\d*"/g, '');
}

test('element-addition-at-the-start', async () => {
	const uri = await createTestFile('element-addition-at-the-start.html')
  await setText(`<h1>a</h1>`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'})
	
	{
		const edit = {
  "rangeOffset": 0,
  "rangeLength": 0,
  "text": "<h1>b</h1>"
}
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
	assert.equal(adjust(html), `<html><head></head><body><h1>b</h1><h1>a</h1></body></html>`);
	
		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
