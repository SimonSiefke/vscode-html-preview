// 1. open index.html
// 2. click the checkbox
// 3. add a label before the input
// 4. check that the checkbox is still checked

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
    path.join(__dirname, 'checkbox-stays-checked-workspace-dist', file).replace('dist', 'src')
  )
}

test('checkbox stays checked', async () => {
  await activateExtension()
  const uri = getUri('index.html')
  const document = await vscode.workspace.openTextDocument(uri)
  await vscode.window.showTextDocument(document)
  const text = document.getText()
  // await new Promise(resolve => setTimeout(resolve, 3000));
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' })
  await page.evaluate(() => {
    // @ts-ignore
    const $checkbox = document.querySelector('input[type="checkbox"]')
    $checkbox.click()
    if ($checkbox.checked !== true) {
      throw new Error('failed to toggle checkbox')
    }
  })
  const edit = {
    rangeOffset: text.indexOf('<input'),
    rangeLength: 0,
    text: '<label for="newsletter">receive newsletter</label>',
  }
  const vscodeEdit = new vscode.WorkspaceEdit()
  vscodeEdit.replace(
    uri,
    new vscode.Range(
      document.positionAt(edit.rangeOffset),
      document.positionAt(edit.rangeOffset + edit.rangeLength)
    ),
    edit.text
  )
  await vscode.workspace.applyEdit(vscodeEdit)
  await page.evaluate(() => {
    // @ts-ignore
    const $checkbox = document.querySelector('input[type="checkbox"]')
    if ($checkbox.checked !== true) {
      throw new Error("checkbox isn't checked")
    }

    // @ts-ignore
    const $label = document.querySelector('label')
    if (!$label) {
      throw new Error('no label was inserted')
    }
  })
  await browser.close()
})
