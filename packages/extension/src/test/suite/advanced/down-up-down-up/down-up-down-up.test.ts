import { activateExtension } from '../../../test-util'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as path from 'path'

const headless = true

function getBrowser() {
  return puppeteer.launch({ headless, args: ['--no-sandbox'] })
}

function getUri(file) {
  return vscode.Uri.file(
    path.join(__dirname, 'down-up-down-up-workspace-dist', file).replace('dist', 'src')
  )
}

let received = false

function waitForUpdateStart(page) {
  received = false
  page._client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
    received = true
  })
}
function waitForUpdateEnd(page) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('no update received'))
    }, 50)
    if (received) {
      resolve()
    } else {
      page._client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
        resolve()
      })
    }
  })
}

const sleep = () => new Promise(resolve => setTimeout(resolve, 1))

test('moving line down and up and down and up', async () => {
  await activateExtension()
  const uri = getUri('index.html')
  const document = await vscode.workspace.openTextDocument(uri)
  vscode.window.showTextDocument(document)
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' })
  const text = vscode.window.activeTextEditor.document.getText()
  const endOfH1Position = vscode.window.activeTextEditor.document.positionAt(
    text.indexOf('</h1>') + '</h1>'.length
  )
  vscode.window.activeTextEditor.selection = new vscode.Selection(endOfH1Position, endOfH1Position)
  const down = () => vscode.commands.executeCommand('editor.action.moveLinesDownAction')
  const up = () => vscode.commands.executeCommand('editor.action.moveLinesUpAction')
  const checkH1Outside = () =>
    page.evaluate(() => {
      const expected = `<section>\n</section>\n<h1>hello world</h1>\n`
      // @ts-ignore
      const actual = document.body.innerHTML
      if (actual !== expected) {
        throw new Error('wrong html, expected' + expected + 'got' + actual)
      }
    })
  const checkH1Inside = () =>
    page.evaluate(() => {
      const expected = `<section>\n  <h1>hello world</h1>\n</section>\n`
      // @ts-ignore
      const actual = document.body.innerHTML
      if (actual !== expected) {
        throw new Error('wrong html, expected' + expected + 'got' + actual)
      }
    })
  waitForUpdateStart(page)
  await down()
  await waitForUpdateEnd(page)
  await sleep()
  await checkH1Outside()
  waitForUpdateStart(page)
  await up()
  await waitForUpdateEnd(page)
  await sleep()
  await checkH1Inside()
  waitForUpdateStart(page)
  await down()
  await waitForUpdateEnd(page)
  await sleep()
  await checkH1Outside()
  await browser.close()
})
