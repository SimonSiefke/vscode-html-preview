import { parse, SuccessResult } from './parse2'
import * as assert from 'assert'
import { generateDom } from './generateDom'

const expectGenerateDom = (text: string) => ({
  toEqual: (expectedDom: string) => {
    const parsed = parse(
      text,
      (() => {
        let id = 0
        return () => id++
      })()
    )
    assert.strictEqual(parsed.status, 'success')
    const generatedDom = generateDom(parsed as SuccessResult)
    assert.strictEqual(generatedDom, expectedDom)
  },
})

test('basic', () => {
  expectGenerateDom(`<h1>hello world</h1>`).toEqual(
    `<html data-id="html"><head data-id="head"></head><body data-id="body"><h1 data-id="0">hello world</h1><script type="module" src="http://localhost:3000/html-preview.js" data-id="html-preview"></script></body></html>`
  )
})

test('only comment', () => {
  expectGenerateDom(`<!---->`).toEqual(
    `<!----><html data-id="html"><head data-id="head"></head><body data-id="body"><script type="module" src="http://localhost:3000/html-preview.js" data-id="html-preview"></script></body></html>`
  )
})
