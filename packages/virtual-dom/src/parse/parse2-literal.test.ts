import * as assert from 'assert'
import { CommentNode, ElementNode, TextNode, DoctypeNode } from '../diff/diff2'
import { parse as _parse } from './parse2'
import { isSelfClosingTag } from './utils'

const stringifyNode = (node: ElementNode | TextNode | CommentNode | DoctypeNode) => {
  switch (node.nodeType) {
    case 'ElementNode':
      return `<${node.tag}${Object.entries(node.attributes)
        .map(([key, value]) => (value === null ? ` ${key}` : ` ${key}="${value}"`))
        .join('')}>${stringify(node.children)}${isSelfClosingTag(node.tag) ? '' : `</${node.tag}>`}`
    case 'TextNode':
      return node.text
    case 'Doctype':
      return `<!DOCTYPE html>`
    case 'CommentNode':
      return `<!--${node.text}-->`
  }
}

const stringify = nodes => {
  return nodes.map(stringifyNode).join('')
}

const expectParse = (text: string) => ({
  toEqual: (expectedText: string) => {
    const result = _parse(
      text,
      (() => {
        let id = 0
        return () => id++
      })()
    )
    assert.strictEqual(result.status, 'success')
    assert.strictEqual(stringify((result as any).nodes), expectedText)
  },
  toFail: () => {
    const result = _parse(
      text,
      (() => {
        let id = 0
        return () => id++
      })()
    )
    assert.strictEqual(result.status, 'invalid')
  },
})

test('h1 000, implicit html, implicit head, implicit body', () => {
  expectParse(`<h1>hello world</h1>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test(`h1 001, implicit html, implicit head, explicit body`, () => {
  expectParse(`<body><h1>hello world</h1></body>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test(`h1 010, implicit html, explicit head, implicit body`, () => {
  expectParse(`<head></head><h1>hello world</h1>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test(`h1 011, implicit html, explicit head, explicit body`, () => {
  expectParse(`<head></head><body><h1>hello world</h1></body>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test('h1 100, explicit html, implicit head, implicit body', () => {
  expectParse(`<html><h1>hello world</h1></html>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test('h1 101, explicit html, implicit head, explicit body', () => {
  expectParse(`<html><body><h1>hello world</h1></body></html>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test('h1 110, explicit html, explicit head, implicit body', () => {
  expectParse(`<html><head></head><h1>hello world</h1></html>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test('h1 111, explicit html, explicit head, explicit body', () => {
  expectParse(`<html><head></head><body><h1>hello world</h1></body></html>`).toEqual(
    `<html><head></head><body><h1>hello world</h1></body></html>`
  )
})

test('meta 000, implicit html, implicit head, implicit body', () => {
  expectParse(`<meta charset="utf-8">`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 001, implicit html, implicit head, explicit body', () => {
  expectParse(`<meta charset="utf-8"><body></body>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 010, implicit html, explicit head, implicit body', () => {
  expectParse(`<head><meta charset="utf-8"></head>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 011, implicit html, explicit head, explicit body', () => {
  expectParse(`<head><meta charset="utf-8"></head><body></body>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 100, explicit html, implicit head, implicit body', () => {
  expectParse(`<html><meta charset="utf-8"></html>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 101, explicit html, implicit head, explicit body', () => {
  expectParse(`<html><meta charset="utf-8"><body></body></html>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 110, explicit html, explicit head, implicit body', () => {
  expectParse(`<html><head><meta charset="utf-8"></head></html>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('meta 111, explicit html, explicit head, explicit body', () => {
  expectParse(`<html><head><meta charset="utf-8"></head><body></body></html>`).toEqual(
    `<html><head><meta charset="utf-8"></head><body></body></html>`
  )
})

test('comment 000, implicit html, implicit head, implicit body', () => {
  expectParse(`<!---->`).toEqual(`<!----><html><head></head><body></body></html>`)
})

test('comment 001, implicit html, implicit head, explicit body', () => {
  expectParse(`<!----><body></body>`).toEqual(`<!----><html><head></head><body></body></html>`)
})

test('comment 010, implicit html, explicit head, implicit body', () => {
  expectParse(`<!----><head></head>`).toEqual(`<!----><html><head></head><body></body></html>`)
})

test('comment 011, implicit html, explicit head, explicit body', () => {
  expectParse(`<!----><head></head><body></body>`).toEqual(
    `<!----><html><head></head><body></body></html>`
  )
})

test('comment 100, explicit html, implicit head, implicit body', () => {
  expectParse(`<!----><html></html>`).toEqual(`<!----><html><head></head><body></body></html>`)
})

test('comment 101, explicit html, implicit head, explicit body', () => {
  expectParse(`<!----><html><body></body></html>`).toEqual(
    `<!----><html><head></head><body></body></html>`
  )
})

test('comment 110, explicit html, explicit head, implicit body', () => {
  expectParse(`<!----><html><head></head></html>`).toEqual(
    `<!----><html><head></head><body></body></html>`
  )
})

test('comment 111, explicit html, explicit head, explicit body', () => {
  expectParse(`<!----><html><head></head><body></body></html>`).toEqual(
    `<!----><html><head></head><body></body></html>`
  )
})

test('simple document', () => {
  expectParse(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <h1>hello world</h1>
  </body>
</html>`).toEqual(`<!DOCTYPE html>
<html><head>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>hello world</h1>
  </body></html>`)
})

test('incomplete doctype', () => {
  expectParse(`<!DOCTYPE htm>`).toFail()
})

test('only doctype', () => {
  expectParse(`<!DOCTYPE html>`).toEqual(`<!DOCTYPE html><html><head></head><body></body></html>`)
})

test('document with base tag', () => {
  expectParse(`<!DOCTYPE html>
<html>
  <head>
    <base href=http://www.example.com/ target=_self />
  </head>
  <body>
    hello world
  </body>
</html>`).toEqual(`<!DOCTYPE html>
<html><head>
    <base href="http://www.example.com/" target="_self">
  </head>
  <body>
    hello world
  </body></html>`)
})

test('self-closing tag', () => {
  expectParse(`<br>`).toEqual(`<html><head></head><body><br></body></html>`)
})

test('attribute', () => {
  expectParse(`<h1 class="big"></h1>`).toEqual(
    `<html><head></head><body><h1 class="big"></h1></body></html>`
  )
})

test('only text', () => {
  expectParse(`hello world`).toEqual(`<html><head></head><body>hello world</body></html>`)
})

test('only html', () => {
  expectParse(`<html></html>`).toEqual(`<html><head></head><body></body></html>`)
})

test('only head', () => {
  expectParse(`<head></head>`).toEqual(`<html><head></head><body></body></html>`)
})

test('only body', () => {
  expectParse(`<body></body>`).toEqual(`<html><head></head><body></body></html>`)
})

test('attribute without value', () => {
  expectParse(`<h1 class></h1>`).toEqual(`<html><head></head><body><h1 class></h1></body></html>`)
})

test('invalid tag in head', () => {
  expectParse(`<head><h1>hello world</h1></head>`).toFail()
})

test('invalid text after body', () => {
  expectParse(`<body></body>hello world`).toFail()
})

test('invalid text before html', () => {
  expectParse(`hello world<html></html>`).toFail()
})

test('invalid text after html', () => {
  expectParse(`<html></html>hello world`).toFail()
})

test('invalid text before head', () => {
  expectParse(`hello world<head></head>`).toFail()
})

test('invalid text inside head', () => {
  expectParse(`<head>hello world</head>`).toFail()
})

test('invalid text before body', () => {
  expectParse(`hello world<body></body>`).toFail()
})

test('invalid text after body', () => {
  expectParse(`<body></body>hello world`).toFail()
})

test('invalid closing tag inside body', () => {
  expectParse('<body></div></body>').toFail()
})

test('invalid closing tag after body', () => {
  expectParse(`<body></body></body>`).toFail()
})

test('title', () => {
  expectParse(`<title>HTML 5.2</title>`).toEqual(
    `<html><head><title>HTML 5.2</title></head><body></body></html>`
  )
})

test('style inside head', () => {
  expectParse(`<head><style></style></head>`).toEqual(
    `<html><head><style></style></head><body></body></html>`
  )
})

test('style inside body', () => {
  expectParse(`<body><style></style></body>`).toEqual(
    `<html><head></head><body><style></style></body></html>`
  )
})

test('only meta', () => {
  expectParse(`<meta itemprop="price" content="0" />`).toEqual(
    `<html><head><meta itemprop="price" content="0"></head><body></body></html>`
  )
})

test('meta inside body', () => {
  expectParse(`<body><meta itemprop="price" content="0" /></body>`).toEqual(
    `<html><head></head><body><meta itemprop="price" content="0"></body></html>`
  )
})

test.skip('title inside body', () => {
  expectParse(`<body><title>hello world</title></body>`).toFail()
})

test('title inside svg', () => {
  expectParse(`<body><svg><title>hello world</title></svg></body>`).toEqual(
    `<html><head></head><body><svg><title>hello world</title></svg></body></html>`
  )
})

test('whitespace nodes inside html', () => {
  expectParse(`<html><head></head><body></body></html>`).toEqual(
    `<html><head></head><body></body></html>`
  )
})

test('only tag and whitespace', () => {
  expectParse(`<h1 class></h1>
`).toEqual(`<html><head></head><body><h1 class></h1>
</body></html>`)
})

test('whitespace inside explicit body', () => {
  expectParse(`<body><h1 class></h1>
</body>`).toEqual(`<html><head></head><body><h1 class></h1>
</body></html>`)
})

test('text after element', () => {
  expectParse(`<h1 class>hello world</h1>
p`).toEqual(`<html><head></head><body><h1 class>hello world</h1>
p</body></html>`)
})

test('element after element', () => {
  expectParse(`<h1 class>hello world</h1>
<p></p>`).toEqual(`<html><head></head><body><h1 class>hello world</h1>
<p></p></body></html>`)
})
