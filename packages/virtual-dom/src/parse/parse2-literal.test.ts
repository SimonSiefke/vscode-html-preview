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
</html>`).toEqual(`<!DOCTYPE html><html><head>
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
</html>`).toEqual(`<!DOCTYPE html><html><head>
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

test('empty', () => {
  expectParse(``).toEqual(`<html><head></head><body></body></html>`)
})

test('whitespace after explicit html', () => {
  expectParse(`<html>
  <body>
    <p>this is a paragraph</p>
  </body>
</html>
`).toEqual(`<html><head></head><body>
    <p>this is a paragraph</p>
  </body></html>`)
})

test('document with lots of whitespace', () => {
  expectParse(`<html>

<head>
  <title>Document</title>
  <style>
  </style>
</head>

<body>

</body>

</html>`).toEqual(`<html><head>
  <title>Document</title>
  <style>
  </style>
</head>

<body>

</body></html>`)
})

test('text after head', () => {
  expectParse(`<!DOCTYPE html>
<head>
</head>
hello world
h1`).toEqual(`<!DOCTYPE html><html><head>
</head>
<body>hello world
h1</body></html>`)
})

test('implicit whitespace before body end', () => {
  expectParse(`<style>
  h1 {
    color: cornflowerblue;
  }
</style>

<h1>hello world</h1>

<h2>this is live preview</h2>`).toEqual(`<html><head><style>
  h1 {
    color: cornflowerblue;
  }
</style>

</head><body><h1>hello world</h1>

<h2>this is live preview</h2></body></html>`)
})

test('only comments', () => {
  expectParse(`<!--a--><!--c-->`).toEqual(`<!--a--><!--c--><html><head></head><body></body></html>`)
})

test('text between comments', () => {
  expectParse(`<!--a-->b<!--c-->`).toEqual(
    `<!--a--><html><head></head><body>b<!--c--></body></html>`
  )
})

test('whitespace after comments', () => {
  expectParse(`<!--a--><!--c-->
`).toEqual(`<!--a--><!--c--><html><head></head><body></body></html>`)
})

test('weird start 1', () => {
  expectParse(`<!DOCTYPE html>
<!-- hello -->
world
<!-- ! -->`).toEqual(`<!DOCTYPE html><!-- hello --><html><head></head><body>
world
<!-- ! --></body></html>`)
})

test('weird start 2', () => {
  expectParse(`<!DOCTYPE html>
<html>
hello
</html>`).toEqual(`<!DOCTYPE html><html><head></head><body>
hello
</body></html>`)
})

test('weird start 3', () => {
  expectParse(`<!Doctype html>
hello`).toEqual(`<!DOCTYPE html><html><head></head><body>
hello</body></html>`)
})

test('weird start 4', () => {
  expectParse(`<!DOCTYPE html>
<body>
  hello
</body>`).toEqual(`<!DOCTYPE html><html><head></head><body>
  hello
</body></html>`)
})

test('weird start 5', () => {
  expectParse(`<!DOCTYPE html>
<body>
</body>`).toEqual(`<!DOCTYPE html><html><head></head><body>
</body></html>`)
})

test('weird start 6', () => {
  expectParse(`<!DOCTYPE html>
<html>
  <body>
    hello
  </body>
</html>`).toEqual(`<!DOCTYPE html><html><head></head><body>
    hello
  </body></html>`)
})

test('weird start 7', () => {
  expectParse(`<!DOCTYPE html>
<head>
</head>
hello`).toEqual(`<!DOCTYPE html><html><head>
</head>
<body>hello</body></html>`)
})

test('weird start 8', () => {
  expectParse(`<!DOCTYPE html>
<head>
  hello
</head>`).toFail()
})

test('weird start 9', () => {
  expectParse(`<!DOCTYPE html>
<html>
  hello
  <body>
    world
  </body>
</html>`).toFail()
})

test('weird start 10', () => {
  expectParse(`<!DOCTYPE html>
hello
<html>
  world
</html>`).toFail()
})

test('weird start 11', () => {
  expectParse(`<!DOCTYPE html>
hello
<html>
  <head>
  </head>
  world
</html>`).toFail()
})

test('weird start 12', () => {
  expectParse(`<!DOCTYPE html>
<html>
  <head>
  </head>
  hello
</html>`).toEqual(`<!DOCTYPE html><html><head>
  </head>
  <body>hello
</body></html>`)
})

test('weird start 13', () => {
  expectParse(`<!-- hello -->
<!DOCTYPE html>
world`).toEqual(`<!DOCTYPE html><html><head></head><body>
world</body></html>`)
})

test('weird start 14', () => {
  expectParse(`<!DOCTYPE html>
<body>
  hello
</body>
<!--world-->`).toEqual(`<!DOCTYPE html><html><head></head><body>
  hello
</body><!--world--></html>`)
})

// TODO other top tests
test('top 111, implicit html, implicit head, implicit body', () => {
  expectParse(`<title></title>
<b></b>`).toEqual(`<html><head><title></title>
</head><body><b></b></body></html>`)
})

test('top 201, explicit html, no head, implicit body', () => {
  expectParse(`<html>
  <b></b>
</html>`).toEqual(`<html><head></head><body><b></b>
</body></html>`)
})

test('whitespace and text after head', () => {
  expectParse(`<head></head>
a<h1>hello world</h1>`).toEqual(`<html><head></head>
<body>a<h1>hello world</h1></body></html>`)
})

// test('whitespace after implicit head', () => {
//   expectParse(`<title>updating title</title>
// <body><h1>hello world</h1></body>`).toEqual(
//     `<html><head><title>updating title</title>
// </head><body><h1>hello world</h1></body></html>`
//   )
// })

test('open implies close 1', () => {
  expectParse(`<ruby>Text goes here<rt>annotation goes here</ruby>`).toEqual(
    `<html><head></head><body><ruby>Text goes here<rt>annotation goes here</rt></ruby></body></html>`
  )
})

test('open implies close 2', () => {
  expectParse(`<dl>
  <dt> Authors
  <dd> John
  <dd> Luke
  <dt> Editor
  <dd> Frank
</dl>`).toEqual(`<html><head></head><body><dl>
  <dt> Authors
  </dt><dd> John
  </dd><dd> Luke
  </dd><dt> Editor
  </dt><dd> Frank
</dd></dl></body></html>`)
})

test('open implies close 3', () => {
  expectParse(`<ul>
  <li>1
  <li>2
</ul>`).toEqual(`<html><head></head><body><ul>
  <li>1
  </li><li>2
</li></ul></body></html>`)
})

test('open implies close 4', () => {
  expectParse(`<ol>
  <li>1
  <li>2
</ol>`).toEqual(`<html><head></head><body><ol>
  <li>1
  </li><li>2
</li></ol></body></html>`)
})

test('open implies close 5', () => {
  expectParse(`<ruby>B
  <rt>a
  <rt>a
</ruby>
<ruby>A
  <rt>a
  <rt>a
</ruby>
<ruby>S
  <rt>a
  <rt>a
</ruby>
<ruby>E
  <rt>
  <rt>a
</ruby>`).toEqual(`<html><head></head><body><ruby>B
  <rt>a
  </rt><rt>a
</rt></ruby>
<ruby>A
  <rt>a
  </rt><rt>a
</rt></ruby>
<ruby>S
  <rt>a
  </rt><rt>a
</rt></ruby>
<ruby>E
  <rt>
  </rt><rt>a
</rt></ruby></body></html>`)
})

test('open implies closed 6', () => {
  expectParse(`<p>hello world`).toEqual(`<html><head></head><body><p>hello world</p></body></html>`)
})

test('open implies closed 7', () => {
  expectParse(`<p>You are: <span id="status">(Unknown)</span></p>

<header>
</header>`).toEqual(`<html><head></head><body><p>You are: <span id=\"status\">(Unknown)</span></p>

<header>
</header></body></html>`)
})

test('basic element', () => {
  expectParse(`<h1><p>ok</p></h1>`).toEqual(
    `<html><head></head><body><h1><p>ok</p></h1></body></html>`
  )
})

test('table', () => {
  expectParse(`<table>
  <tbody>
    <tr><td>1</td></tr>
    <tr><td>2</td></tr>
    <tr><td>3</td></tr>
  </tbody>
</table>`).toEqual(`<html><head></head><body><table>
  <tbody>
    <tr><td>1</td></tr>
    <tr><td>2</td></tr>
    <tr><td>3</td></tr>
  </tbody>
</table></body></html>`)
})

test('table with implicit tbody', () => {
  expectParse(`<table>
  <tr><td>1</td></tr>
  <tr><td>2</td></tr>
  <tr><td>3</td></tr>
</table>`).toEqual(`<html><head></head><body><table>
  <tbody><tr><td>1</td></tr>
  <tr><td>2</td></tr>
  <tr><td>3</td></tr>
</tbody></table></body></html>`)
})

test('nested html', () => {
  expectParse(`<div>
  <img src="https://source.unsplash.com/random" alt="random image">
  <p>nested <strong>text</strong></p>
</div>`).toEqual(`<html><head></head><body><div>
  <img src=\"https://source.unsplash.com/random\" alt=\"random image\">
  <p>nested <strong>text</strong></p>
</div></body></html>`)
})

test.skip('th without thead', () => {
  expectParse(`<table>
  <tr><th>1</th></tr>
</table>`).toFail()
})

test.skip('li without ul', () => {
  expectParse(`<li></li>`).toFail()
})

test.skip('invalid tag inside ul', () => {
  expectParse(`<ul>
  <l></l>
</ul>`).toFail()
})

test('unclosed tr', () => {
  expectParse(`<table class="sortable">
  <thead>
    <tr>
      <th> Game
      <th> Corporations
      <th> Map Size
  <tbody>
    <tr>
      <td> 1830
      <td> <data value="8">Eight</data>
      <td> <data value="93">19+74 hexes (93 total)</data>
    <tr>
      <td> 1856
      <td> <data value="11">Eleven</data>
      <td> <data value="99">12+87 hexes (99 total)</data>
    <tr>
      <td> 1870
      <td> <data value="10">Ten</data>
      <td> <data value="149">4+145 hexes (149 total)</data>
</table>`)
})

test('p inside dl', () => {
  expectParse(`<!DOCTYPE html>
<html>
  <body>
    <dl>
      <dt> 1
      <dd>
        <p> 2
          <dl>
            <dt> 3
            <dd>
              <p> 4
            <dt> 5
          </dl>
      </dd>
    </dl>
  </body>
</html>`).toEqual(`<!DOCTYPE html><html><head></head><body>
    <dl>
      <dt> 1
      </dt><dd>
        <p> 2
          </p><dl>
            <dt> 3
            </dt><dd>
              <p> 4
            </p></dd><dt> 5
          </dt></dl>
      </dd>
    </dl>
  </body></html>`)
})

test('pre', () => {
  expectParse(` <pre>
body {
color: red;
}
</pre>`).toEqual(`<html><head></head><body><pre>
body {
color: red;
}
</pre></body></html>`)
})

test('partial end tag', () => {
  expectParse(`<h4>hello world<`).toFail()
})

test('noscript', () => {
  expectParse(`
<body>
  <noscript>
    <input type=submit value="Calculate Square">
  </noscript>
</body>`).toEqual(`<html><head></head><body>
  <noscript>
    <input type=submit value=\"Calculate Square\">
  </noscript>
</body></html>`)
})
