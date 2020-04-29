import { scan } from './scanner2'

const expectTokens = (text: string) => ({
  toEqual: (expectedTokens: any) => {
    const result = scan(text)
    expect(result.status).toBe('success')
    expect((result as any).tokens).toEqual(expectedTokens)
  },
  toFail: () => {
    expect(scan(text)).toEqual({
      status: 'invalid',
      index: expect.any(Number),
    })
  },
})

test('basic', () => {
  expectTokens(`<h1>hello world</h1>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: 'hello world', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'h1', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('comment', () => {
  expectTokens(`<!---->`).toEqual([{ text: '<!---->', type: 'Comment' }])
})

test('self closing tag', () => {
  expectTokens('<input />').toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'input', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: '/>', type: 'StartTagSelfClosingBracket' },
  ])
})

test('invalid tag name', () => {
  expectTokens(`<123`).toFail()
})

test('dashed-tag', () => {
  expectTokens('<base-button></base-button>').toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'base-button', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'base-button', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('open angle bracket at invalid location', () => {
  expectTokens(`< abc`).toFail()
})

test('invalid character after start tag', () => {
  expectTokens(`i<len;`).toFail()
})

test('whitespace inside end tag', () => {
  expectTokens(`<foo            >
  </foo        >`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'foo', type: 'StartTagName' },
    { text: '            ', type: 'Whitespace' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n  ', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'foo', type: 'EndTagName' },
    { text: '        ', type: 'Whitespace' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('attribute with double quotes', () => {
  expectTokens(`<h1 class="">`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'class', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '""', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('attribute with single quotes', () => {
  expectTokens(`<h1 class=''>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'class', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: "''", type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('dashed attribute name', () => {
  expectTokens(`<h1 aria-label="">`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'aria-label', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '""', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('invalid character inside start tag', () => {
  expectTokens(`<h1 class="" /`).toFail()
})

test('html entities', () => {
  expectTokens(`&nbsp;`).toEqual([{ text: '&nbsp;', type: 'Content' }])
})

test('umlauts', () => {
  expectTokens(`<bä>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'bä', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('doctype', () => {
  expectTokens(`<!doctype html>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: '!doctype html', type: 'DocType' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('DOCTYPE', () => {
  expectTokens(`<!DOCTYPE html>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: '!DOCTYPE html', type: 'DocType' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('doctype and html', () => {
  expectTokens(`<!DOCTYPE html>
  <html lang="en"><head>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: '!DOCTYPE html', type: 'DocType' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n  ', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'html', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'lang', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"en"', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'head', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('multiple attributes', () => {
  expectTokens(
    `<!doctype html><html itemscope="" itemtype="http://schema.org/SearchResultsPage" lang="en">`
  ).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: '!doctype html', type: 'DocType' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'html', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'itemscope', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '""', type: 'QuotedAttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'itemtype', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"http://schema.org/SearchResultsPage"', type: 'QuotedAttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'lang', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"en"', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('multiline comment', () => {
  expectTokens(`<!--
-->`).toEqual([{ text: '<!--\n-->', type: 'Comment' }])
})

test('whitespace around attribute equal sign', () => {
  expectTokens(`<h1 class = "1"`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'class', type: 'AttributeName' },
    { text: ' ', type: 'Whitespace' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: ' ', type: 'Whitespace' },
    { text: `"1"`, type: 'QuotedAttributeValue' },
  ])
})

test('unquoted attribute', () => {
  expectTokens(`<a href=/></a>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'a', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'href', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '/', type: 'AttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'a', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('embedded style', () => {
  expectTokens(`<style>
body {
  font-size: 24px; /* apply to <body> */
}
</style>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'style', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\nbody {\n  font-size: 24px; /* apply to <body> */\n}\n', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'style', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('unclosed style tag', () => {
  expectTokens(`<style>
  body {
    font-size: 24px; /* apply to <body> */
  }
`).toFail()
})

test('embedded javascript', () => {
  expectTokens(`<script>
for(var b=0;b<a.length;++b){
</script>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'script', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\nfor(var b=0;b<a.length;++b){\n', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'script', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('unclosed script tag', () => {
  expectTokens(` <script>
  for(var b=0;b<a.length;++b){
`).toFail()
})

test('attribute with colon', () => {
  expectTokens(`<svg xml:space="preserve">`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'svg', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'xml:space', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"preserve"', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('attribute without value', () => {
  expectTokens(`<h1 class>hello world</h1>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'class', type: 'AttributeName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: 'hello world', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'h1', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('mixed attributes', () => {
  expectTokens(`<h1 class x=2>hello world</h1>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'class', type: 'AttributeName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'x', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '2', type: 'AttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: 'hello world', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'h1', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('multiple unquoted attribute values', () => {
  expectTokens(`<h1 x=2 x=2>hello world</h1>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'h1', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'x', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '2', type: 'AttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'x', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '2', type: 'AttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: 'hello world', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'h1', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('older doctype', () => {
  expectTokens(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr"  lang="en-US" >`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    {
      text:
        '!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"',
      type: 'DocType',
    },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'html', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'xmlns', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"http://www.w3.org/1999/xhtml"', type: 'QuotedAttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'dir', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"ltr"', type: 'QuotedAttributeValue' },
    { text: '  ', type: 'Whitespace' },
    { text: 'lang', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"en-US"', type: 'QuotedAttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('small document', () => {
  expectTokens(`<!DOCTYPE html>
<html>
  <head>
    <base href=http://www.example.com/ target=_self />
  </head>
  <body>
    asdasdasdasdasdasd
  </body>
</html>`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: '!DOCTYPE html', type: 'DocType' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'html', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n  ', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'head', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n    ', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'base', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'href', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: 'http://www.example.com/', type: 'AttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'target', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '_self', type: 'AttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: '/>', type: 'StartTagSelfClosingBracket' },
    { text: '\n  ', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'head', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
    { text: '\n  ', type: 'Content' },
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'body', type: 'StartTagName' },
    { text: '>', type: 'StartTagClosingBracket' },
    { text: '\n    asdasdasdasdasdasd\n  ', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'body', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
    { text: '\n', type: 'Content' },
    { text: '</', type: 'EndTagOpeningBracket' },
    { text: 'html', type: 'EndTagName' },
    { text: '>', type: 'EndTagOpeningBracket' },
  ])
})

test('whitespace after attribute without value', () => {
  expectTokens(`<div data-pjax-container >`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'div', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'data-pjax-container', type: 'AttributeName' },
    { text: ' ', type: 'Whitespace' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('underscore in attribute name', () => {
  expectTokens(`<div vertical_align="text_bottom">`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'div', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'vertical_align', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"text_bottom"', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('angle brackets inside quoted attribute value', () => {
  expectTokens(`<div aria-label="Add bold text <ctrl+b>">`).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'div', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'aria-label', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"Add bold text <ctrl+b>"', type: 'QuotedAttributeValue' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('self closing bracket directly after attribute value quote', () => {
  expectTokens(
    `<meta property="og:title" content="Visual Studio Code - Code Editing. Redefined"/>`
  ).toEqual([
    { text: '<', type: 'StartTagOpeningBracket' },
    { text: 'meta', type: 'StartTagName' },
    { text: ' ', type: 'Whitespace' },
    { text: 'property', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"og:title"', type: 'QuotedAttributeValue' },
    { text: ' ', type: 'Whitespace' },
    { text: 'content', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"Visual Studio Code - Code Editing. Redefined"', type: 'QuotedAttributeValue' },
    { text: '/>', type: 'StartTagSelfClosingBracket' },
  ])
})

test('conditional comments', () => {
  expectTokens(`<!--[if IE 6]>
<style type="text/css"><!--

--></style>
<![endif]-->`).toFail()
})

test('double dashes in comment', () => {
  expectTokens(`<!-- ------------------ HEADER BEGINS HERE -------------------- -->`).toFail()
})
