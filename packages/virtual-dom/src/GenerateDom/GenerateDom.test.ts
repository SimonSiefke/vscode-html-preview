import * as assert from 'assert'
import { generateDom } from './GenerateDom'
import { parse, SuccessResult } from '../parse/parse2'

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
    `<html data-id=\"html\"><head data-id=\"head\"></head><body data-id=\"body\"><h1 data-id=\"0\">hello world</h1><script id=\"virtual-dom\" type=\"application/json\">{\"status\":\"success\",\"nodes\":[{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"TextNode\",\"text\":\"hello world\",\"id\":\"1\"}],\"nodeType\":\"ElementNode\",\"tag\":\"h1\",\"id\":\"0\"}],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"}],\"nodeMap\":{\"0\":{\"attributes\":{},\"children\":[{\"nodeType\":\"TextNode\",\"text\":\"hello world\",\"id\":\"1\"}],\"nodeType\":\"ElementNode\",\"tag\":\"h1\",\"id\":\"0\"},\"1\":{\"nodeType\":\"TextNode\",\"text\":\"hello world\",\"id\":\"1\"},\"html\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"TextNode\",\"text\":\"hello world\",\"id\":\"1\"}],\"nodeType\":\"ElementNode\",\"tag\":\"h1\",\"id\":\"0\"}],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"},\"head\":{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},\"body\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[{\"nodeType\":\"TextNode\",\"text\":\"hello world\",\"id\":\"1\"}],\"nodeType\":\"ElementNode\",\"tag\":\"h1\",\"id\":\"0\"}],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}}}</script><script id=\"html-preview\" type=\"module\" src=\"http://localhost:3000/html-preview.js\"></script></body></html>`
  )
})

test('only comment', () => {
  expectGenerateDom(`<!---->`).toEqual(
    `<!----><html data-id=\"html\"><head data-id=\"head\"></head><body data-id=\"body\"><script id=\"virtual-dom\" type=\"application/json\">{\"status\":\"success\",\"nodes\":[{\"text\":\"\",\"nodeType\":\"CommentNode\",\"id\":\"0\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"}],\"nodeMap\":{\"0\":{\"text\":\"\",\"nodeType\":\"CommentNode\",\"id\":\"0\"},\"html\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"},\"head\":{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},\"body\":{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}}}</script><script id=\"html-preview\" type=\"module\" src=\"http://localhost:3000/html-preview.js\"></script></body></html>`
  )
})

test('closing script tag', () => {
  expectGenerateDom(`<!-- <script></script> -->`).toEqual(
    `<!-- <script></script> --><html data-id=\"html\"><head data-id=\"head\"></head><body data-id=\"body\"><script id=\"virtual-dom\" type=\"application/json\">{\"status\":\"success\",\"nodes\":[{\"text\":\" &lt;script&gt;&lt;/script&gt; \",\"nodeType\":\"CommentNode\",\"id\":\"0\"},{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"}],\"nodeMap\":{\"0\":{\"text\":\" &lt;script&gt;&lt;/script&gt; \",\"nodeType\":\"CommentNode\",\"id\":\"0\"},\"html\":{\"attributes\":{},\"children\":[{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}],\"nodeType\":\"ElementNode\",\"tag\":\"html\",\"id\":\"html\"},\"head\":{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"head\",\"id\":\"head\"},\"body\":{\"attributes\":{},\"children\":[],\"nodeType\":\"ElementNode\",\"tag\":\"body\",\"id\":\"body\"}}}</script><script id=\"html-preview\" type=\"module\" src=\"http://localhost:3000/html-preview.js\"></script></body></html>`
  )
})
