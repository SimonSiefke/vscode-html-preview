import {
  TestCase,
  createTestFile,
  activateExtension,
  closeTestFile,
  setText,
  setCursorPosition,
  type,
} from '../test-util'
import { before, after } from 'mocha'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'

let browser: puppeteer.Browser
let page: puppeteer.Page
const headless = false

let uri: vscode.Uri
before(async () => {
  uri = await createTestFile('hello world.html')
  await setText('')
  await activateExtension()
  browser = await puppeteer.launch({ headless, args: ['--no-sandbox'] })
  page = await browser.newPage()
})

after(async () => {
  await browser.close()
})

// after(async () => {
//   closeTestFile()
// })

async function expectHtml(html) {
  const bodyChildren = await page.$eval('body', async body => {
    function getAst(nodes) {
      if (Array.isArray(nodes)) {
        return nodes.map(getAst)
      }

      const node = nodes

      // @ts-ignore
      if (node.nodeType === Node.ELEMENT_NODE) {
        return {
          nodeType: 'ElementNode',
          // @ts-ignore
          tag: node.tagName.toLowerCase(),
          // @ts-ignore
          attributes: Array.from(node.attributes).reduce(
            (total: any, attribute) => ({
              ...total,
              // @ts-ignore
              [attribute.name]: attribute.value,
            }),
            {}
          ),
          // @ts-ignore
          children: getAst(Array.from(node.childNodes)),
        }
      }

      // @ts-ignore
      if (node.nodeType === Node.TEXT_NODE) {
        return {
          nodeType: 'TextNode',
          // @ts-ignore
          text: node.data,
        }
      }

      // @ts-ignore
      if (node.nodeType === Node.COMMENT_NODE) {
        return {
          nodeType: 'CommentNode',
          // @ts-ignore
          text: node.data,
        }
      }
    }

    let result = getAst(Array.from(body.childNodes))
    const injectedScriptIndex =
      result.findIndex(
        // @ts-ignore
        child => child.tag === 'script' && child.attributes.src === 'html-preview.js'
      ) - 1
    result = result.slice(0, injectedScriptIndex)
    return result
  })
  assert.deepStrictEqual(bodyChildren, html)
}

function adjust(html) {
  return html.replace('<script type="module" src="html-preview.js"></script>', '')
}

test('basic', async () => {
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000')
  const edit = {
    rangeOffset: 0,
    rangeLength: 0,
    text: 'hello world',
  }
  const vscodeEdit = new vscode.WorkspaceEdit()
  const { document } = vscode.window.activeTextEditor
  vscodeEdit.replace(
    uri,
    new vscode.Range(
      document.positionAt(edit.rangeOffset),
      document.positionAt(edit.rangeOffset + edit.rangeLength)
    ),
    edit.text
  )
  await vscode.workspace.applyEdit(vscodeEdit)
  const html = await page.content()
  assert.equal(adjust(html), '<html><head></head><body>hello world</body></html>')
  // await new Promise(resolve => {});
})

// const edit = new vscode.WorkspaceEdit()

// const edits
// edit.replace('uri', new vscode.Range(), newText)
// vscode.workspace.applyEdit(edit)
