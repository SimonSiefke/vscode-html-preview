
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

test('top-121-implicit-html-explicit-head-implicit-body', async () => {
	const uri = await createTestFile('top-121-implicit-html-explicit-head-implicit-body.html')
  await setText(`<head>
  <title></title>
</head>
<b></b>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/top-121-implicit-html-explicit-head-implicit-body.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    
	const html = await page.content()
	assert.equal(adjust(html), `<html><head>
  <title></title>
</head>
<body><b></b></body></html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
