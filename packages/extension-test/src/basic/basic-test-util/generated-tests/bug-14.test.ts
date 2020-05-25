
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

test('bug-14', async () => {
	const uri = await createTestFile('bug-14.html')
  await setText(`<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      ul,
      li {
        list-style: none;
      }
      [aria-selected] {
        background: highlight none repeat scroll 0% 0%;
      }
    </style>
  </head>
  <body>
    <textarea
      wrap="off"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      aria-label="code"
      role="textbox"
      aria-roledescription="editor"
      aria-multiline="true"
      aria-haspopup="true"
      aria-autocomplete="both"
      aria-haspopup="true"
      aria-activedescendant="JavaScript"
      aria-autocomplete="list"
    ></textarea>
    <!-- <input
      aria-haspopup="true"
      aria-autocomplete="list"
      aria-activedescendant="JavaScript"
      role="textbox"
    /> -->

    <ul id="completions" role="listbox" aria-expanded="true">
      <li role="option" aria-selected="true" id="JavaScript">JavaScript</li>
      <li role="option" id="TypeScript">TypeScript</li>
      <li role="option" id="Flow">Flow</li>
    </ul>
    <script>
      const $completions = document.getElementById('completions')
      const $textarea = document.querySelector('textarea')
      let selected = document.getElementById('JavaScript')
      window.addEventListener('keydown', (event) => {
        selected.removeAttribute('aria-selected')
        if (event.key === 'ArrowDown') {
          selected =
            selected.nextElementSibling || $completions.firstElementChild
        } else if (event.key === 'ArrowUp') {
          selected =
            selected.previousElementSibling || $completions.lastElementChild
        }
        selected.setAttribute('aria-selected', true)
        $textarea.setAttribute('aria-activedescendant', selected.id)
        console.log(selected)
      })
    </script>

  </body>
</html>`)
  await activateExtension()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  const browser = await getBrowser()
  const page = await browser.newPage()
  // await new Promise(resolve => setTimeout(resolve, 1000))
  await page.goto('http://localhost:3000/bug-14.html', {waitUntil: 'networkidle2', timeout: 15000})
  // await new Promise(resolve => setTimeout(resolve, 444000))
	
	{
    
    
	const html = await page.content()
	assert.equal(adjust(html), `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      ul,
      li {
        list-style: none;
      }
      [aria-selected] {
        background: highlight none repeat scroll 0% 0%;
      }
    </style>
  </head>
  <body>
    <textarea
      wrap="off"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
      aria-label="code"
      role="textbox"
      aria-roledescription="editor"
      aria-multiline="true"
      aria-haspopup="true"
      aria-autocomplete="both"
      aria-haspopup="true"
      aria-activedescendant="JavaScript"
      aria-autocomplete="list"
    ></textarea>
    <!-- <input
      aria-haspopup="true"
      aria-autocomplete="list"
      aria-activedescendant="JavaScript"
      role="textbox"
    /> -->

    <ul id="completions" role="listbox" aria-expanded="true">
      <li role="option" aria-selected="true" id="JavaScript">JavaScript</li>
      <li role="option" id="TypeScript">TypeScript</li>
      <li role="option" id="Flow">Flow</li>
    </ul>
    <script>
      const $completions = document.getElementById('completions')
      const $textarea = document.querySelector('textarea')
      let selected = document.getElementById('JavaScript')
      window.addEventListener('keydown', (event) => {
        selected.removeAttribute('aria-selected')
        if (event.key === 'ArrowDown') {
          selected =
            selected.nextElementSibling || $completions.firstElementChild
        } else if (event.key === 'ArrowUp') {
          selected =
            selected.previousElementSibling || $completions.lastElementChild
        }
        selected.setAttribute('aria-selected', true)
        $textarea.setAttribute('aria-activedescendant', selected.id)
        console.log(selected)
      })
    </script>

  </body>
</html>`);

		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
