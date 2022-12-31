
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
	page._client().on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
		received = true
	})
}
function waitForUpdateEnd(page){
	return new Promise((resolve, reject)=>{
		setTimeout(() => {
			reject(new Error('no update received'));
		}, 100);
		if(received){
			resolve(undefined)
		} else{
			page._client().on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
				resolve(undefined)
			})
		}
	})
}

function adjust(html) {
	return html.replace(/ data-id="\d*"/g, '');
}

test('script-2', async () => {
	const uri = await createTestFile('script-2.html')
  await setText(`<!DOCTYPE html>
<html>
<body>
      <button id="updateDetails">update</button>
      <script>
        var updateButton = document.getElementById('updateDetails');
        updateButton.addEventListener('click', function onOpen() {
          if (typeof favDialog.showModal === "function") {
            favDialog.showModal();
          } else {
            alert("The <dialog> API is not supported by this browser");
          }
        });
      </script>
</body>
</html>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/script-2.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    	const edit = {
  "rangeOffset": 411,
  "rangeLength": 0,
  "text": "!"
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
	assert.equal(adjust(html), `<!DOCTYPE html><html><head></head><body>
      <button id="updateDetails">update</button>
      <script>
        var updateButton = document.getElementById('updateDetails');
        updateButton.addEventListener('click', function onOpen() {
          if (typeof favDialog.showModal === "function") {
            favDialog.showModal();
          } else {
            alert("The <dialog> API is not supported by this browser!");
          }
        });
      </script>
</body></html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
