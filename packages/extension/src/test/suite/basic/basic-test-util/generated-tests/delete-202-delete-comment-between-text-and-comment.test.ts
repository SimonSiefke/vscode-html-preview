
import {
  createTestFile,
  activateExtension,
  setText,
} from '../../../../test-util'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'

const headless = true

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
	return html.replace(/ data-id="\d*"/g, '');
}

test('delete-202-delete-comment-between-text-and-comment', async () => {
	const uri = await createTestFile('delete-202-delete-comment-between-text-and-comment.html')
  await setText(`a<!--b--><!--c-->`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000/delete-202-delete-comment-between-text-and-comment.html', {waitUntil: 'networkidle2', timeout: 10000})
  //await page.goto('http://localhost:3000/delete-202-delete-comment-between-text-and-comment.html')
	
	{
		const edit = {
  "rangeOffset": 1,
  "rangeLength": 8,
  "text": ""
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
	waitForUpdateStart(page)
	await vscode.workspace.applyEdit(vscodeEdit)
	await waitForUpdateEnd(page)
	const html = await page.content()
	assert.equal(adjust(html), `<html><head></head><body>a<!--c--></body></html>`);
	
		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
