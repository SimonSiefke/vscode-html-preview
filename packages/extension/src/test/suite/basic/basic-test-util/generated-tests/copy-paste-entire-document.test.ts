
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

test('copy-paste-entire-document', async () => {
	const uri = await createTestFile('copy-paste-entire-document.html')
  await setText(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Live Preview</title>
  </head>
  <body>
    <p>this is a paragraph</p>
  </body>
</html>
`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'})
	
	{
		const edit = {
  "rangeOffset": 0,
  "rangeLength": 158,
  "text": "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Live Preview</title>\n  </head>\n  <body>\n    <p>this is a paragraph</p>\n  </body>\n</html>"
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
	await new Promise(resolve=>setTimeout(resolve, 100))
	const html = await page.content()
	
	assert.equal(adjust(html), `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Live Preview</title>
  </head>
  <body>
    <p>this is a paragraph</p>
  

</body></html>`);
	
		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
