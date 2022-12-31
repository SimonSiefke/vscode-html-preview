
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

test('bug-15', async () => {
	const uri = await createTestFile('bug-15.html')
  await setText(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <input
      type="text"
      aria-haspopup="true"
      aria-autocomplete="list"
      aria-activedescendant="JavaScript"
    />
    <ul id="completions" role="listbox" aria-expanded="true">
      <li role="option" aria-selected="true" id="JavaScript">JavaScript</li>
      <li role="option" id="TypeScript">TypeScript</li>
    </ul>
    <!-- <script>
      const completions = ['JavaScript', 'TypeScript']
      const $completions = document.getElementById('completions')
      const create$Completion = (completion) => {
        const $completion = document.createElement('li')
        $completion.textContent = completion
        return $completion
      }
      for (const completion of completions) {
        $completions.append(create$Completion(completion))
      }
    </script> -->
  </body>
</html>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/bug-15.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    	const edit = {
  "rangeOffset": 167,
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
	assert.equal(adjust(html), `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document!</title>
  </head>
  <body>
    <input type="text" aria-haspopup="true" aria-autocomplete="list" aria-activedescendant="JavaScript">
    <ul id="completions" role="listbox" aria-expanded="true">
      <li role="option" aria-selected="true" id="JavaScript">JavaScript</li>
      <li role="option" id="TypeScript">TypeScript</li>
    </ul>
    <!-- <script>
      const completions = ['JavaScript', 'TypeScript']
      const $completions = document.getElementById('completions')
      const create$Completion = (completion) => {
        const $completion = document.createElement('li')
        $completion.textContent = completion
        return $completion
      }
      for (const completion of completions) {
        $completions.append(create$Completion(completion))
      }
    </script> -->
  </body></html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
