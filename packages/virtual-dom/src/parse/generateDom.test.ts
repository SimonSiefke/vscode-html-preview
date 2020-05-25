import * as assert from 'assert'
import { generateDom } from './generateDom'
import { parse, SuccessResult } from './parse2'

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
    `<html data-id=\"html\"><head data-id=\"head\"></head><body data-id=\"body\"><h1 data-id=\"0\">hello world</h1><script id=\"virtual-dom\" type=\"application/json\">{\"status\":\"&quot;success&quot;\",\"nodes\":[{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"&quot;TextNode&quot;\",\"text\":\"&quot;hello world&quot;\",\"id\":\"1\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;h1&quot;\",\"id\":\"0\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;html&quot;\",\"id\":\"&quot;html&quot;\"}],\"nodeMap\":{\"0\":{\"attributes\":{},\"children\":[{\"nodeType\":\"&quot;TextNode&quot;\",\"text\":\"&quot;hello world&quot;\",\"id\":\"1\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;h1&quot;\",\"id\":\"0\"},\"1\":{\"nodeType\":\"&quot;TextNode&quot;\",\"text\":\"&quot;hello world&quot;\",\"id\":\"1\"},\"html\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"&quot;TextNode&quot;\",\"text\":\"&quot;hello world&quot;\",\"id\":\"1\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;h1&quot;\",\"id\":\"0\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;html&quot;\",\"id\":\"&quot;html&quot;\"},\"head\":{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},\"body\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"&quot;TextNode&quot;\",\"text\":\"&quot;hello world&quot;\",\"id\":\"1\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;h1&quot;\",\"id\":\"0\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}}}</script><script id=\"html-preview\" type=\"module\" src=\"http://localhost:3000/html-preview.js\"></script></body></html>`
  )
})

test('only comment', () => {
  expectGenerateDom(`<!---->`).toEqual(
    `<!----><html data-id=\"html\"><head data-id=\"head\"></head><body data-id=\"body\"><script id=\"virtual-dom\" type=\"application/json\">{\"status\":\"&quot;success&quot;\",\"nodes\":[{\"text\":\"&quot;&quot;\",\"nodeType\":\"&quot;CommentNode&quot;\",\"id\":\"0\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;html&quot;\",\"id\":\"&quot;html&quot;\"}],\"nodeMap\":{\"0\":{\"text\":\"&quot;&quot;\",\"nodeType\":\"&quot;CommentNode&quot;\",\"id\":\"0\"},\"html\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;html&quot;\",\"id\":\"&quot;html&quot;\"},\"head\":{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;head&quot;\",\"id\":\"&quot;head&quot;\"},\"body\":{\"attributes\":{},\"children\":[],\"nodeType\":\"&quot;ElementNode&quot;\",\"tag\":\"&quot;body&quot;\",\"id\":\"&quot;body&quot;\"}}}</script><script id=\"html-preview\" type=\"module\" src=\"http://localhost:3000/html-preview.js\"></script></body></html>`
  )
})

test('closing script tag', () => {
  expectGenerateDom(`<!-- <script></script> -->`).toEqual(
    `<!-- <script></script> --><html data-id="html"><head data-id="head"></head><body data-id="body"><script id="virtual-dom" type="application/json">{"status":"&quot;success&quot;","nodes":[{"text":"&quot; &lt;script&gt;&lt;/script&gt; &quot;","nodeType":"&quot;CommentNode&quot;","id":"0"},{"attributes":{},"children":[{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;head&quot;","id":"&quot;head&quot;"},{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;body&quot;","id":"&quot;body&quot;"}],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;html&quot;","id":"&quot;html&quot;"}],"nodeMap":{"0":{"text":"&quot; &lt;script&gt;&lt;/script&gt; &quot;","nodeType":"&quot;CommentNode&quot;","id":"0"},"html":{"attributes":{},"children":[{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;head&quot;","id":"&quot;head&quot;"},{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;body&quot;","id":"&quot;body&quot;"}],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;html&quot;","id":"&quot;html&quot;"},"head":{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;head&quot;","id":"&quot;head&quot;"},"body":{"attributes":{},"children":[],"nodeType":"&quot;ElementNode&quot;","tag":"&quot;body&quot;","id":"&quot;body&quot;"}}}</script><script id="html-preview" type="module" src="http://localhost:3000/html-preview.js"></script></body></html>`
  )
})
