
import {
  createTestFile,
  activateExtension,
  setText,
} from '../../../test-util'
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

test('replace-element-with-style', async () => {
	const uri = await createTestFile('replace-element-with-style.html')
  await setText(`<h1>hello world</h1>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/replace-element-with-style.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    	const edit = {
  "rangeOffset": 0,
  "rangeLength": 20,
  "text": "<style>\n\n  p{\n    color:red;\n    padding: 0.5rem;\n\n  border: 1px solid;\n    transform: rotate(-10deg)\n\n  }\n\n  p:nth-child(even){\n      transform: rotate(10deg)\n\n\n  }\n</style>"
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
	assert.equal(adjust(html), `<html><head><style>

  p{
    color:red;
    padding: 0.5rem;

  border: 1px solid;
    transform: rotate(-10deg)

  }

  p:nth-child(even){
      transform: rotate(10deg)


  }
</style></head><body></body></html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
