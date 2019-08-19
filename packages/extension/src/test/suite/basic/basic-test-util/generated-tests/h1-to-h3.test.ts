
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
	return new Promise((resolve, reject)=>{
		setTimeout(() => {
			reject(new Error('no update received'));
		}, 100);
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

test('h1-to-h3', async () => {
	const uri = await createTestFile('h1-to-h3.html')
  await setText(``)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000/h1-to-h3.html', {waitUntil: 'networkidle2'})
  //await page.goto('http://localhost:3000/h1-to-h3.html')
	
	{
		const edit = {
  "rangeOffset": 0,
  "rangeLength": 0,
  "text": "h1"
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
	assert.equal(adjust(html), `<html><head></head><body>h1</body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 0,
  "rangeLength": 2,
  "text": "<h1></h1>"
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
	assert.equal(adjust(html), `<html><head></head><body><h1></h1></body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 4,
  "rangeLength": 0,
  "text": "first heading"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1></body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 22,
  "rangeLength": 0,
  "text": "\n"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
</body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 23,
  "rangeLength": 0,
  "text": "h2"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
h2</body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 23,
  "rangeLength": 2,
  "text": "<h2></h2>"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2></h2></body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 27,
  "rangeLength": 0,
  "text": "second heading"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2>second heading</h2></body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 46,
  "rangeLength": 0,
  "text": "\n"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2>second heading</h2>
</body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 47,
  "rangeLength": 0,
  "text": "h3"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2>second heading</h2>
h3</body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 47,
  "rangeLength": 2,
  "text": "<h3></h3>"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2>second heading</h2>
<h3></h3></body></html>`);
	
		}

	{
		const edit = {
  "rangeOffset": 51,
  "rangeLength": 0,
  "text": "third heading"
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
	assert.equal(adjust(html), `<html><head></head><body><h1>first heading</h1>
<h2>second heading</h2>
<h3>third heading</h3></body></html>`);
	
		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
