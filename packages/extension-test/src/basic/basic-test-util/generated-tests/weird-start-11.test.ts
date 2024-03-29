
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

test('weird-start-11', async () => {
	const uri = await createTestFile('weird-start-11.html')
  await setText(`<!DOCTYPE html>
hello
<html>
  <head>
  </head>
  world
</html>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/weird-start-11.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    
	const html = await page.content()
	assert.equal(adjust(html), `<!DOCTYPE html><html><head></head><body>
<h1>The HTML is invalid</h1>
<pre><code>
&lt;!DOCTYPE html&gt;
hello
<span style="color:red">&lt;html&gt;
  &lt;h</span>ead&gt;
  &lt;/head&gt;
  world
&lt;/html&gt;
</code>
</pre>
</body></html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
