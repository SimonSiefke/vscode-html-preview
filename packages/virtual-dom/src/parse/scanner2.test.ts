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
  expectTokens(`<!---->`).toEqual([
    { text: '<!--', type: 'CommentStart' },
    { text: '-->', type: 'CommentEnd' },
  ])
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: '"', type: 'ClosingDoubleQuote' },
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
    { text: "'", type: 'OpeningSingleQuote' },
    { text: "'", type: 'ClosingSingleQuote' },
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: '"', type: 'ClosingDoubleQuote' },
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: 'en', type: 'AttributeValue' },
    { text: '"', type: 'ClosingDoubleQuote' },
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: '"', type: 'ClosingDoubleQuote' },
    { text: ' ', type: 'Whitespace' },
    { text: 'itemtype', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: 'http://schema.org/SearchResultsPage', type: 'AttributeValue' },
    { text: '"', type: 'ClosingDoubleQuote' },
    { text: ' ', type: 'Whitespace' },
    { text: 'lang', type: 'AttributeName' },
    { text: '=', type: 'AttributeEqualSign' },
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: 'en', type: 'AttributeValue' },
    { text: '"', type: 'ClosingDoubleQuote' },
    { text: '>', type: 'StartTagClosingBracket' },
  ])
})

test('multiline comment', () => {
  expectTokens(`<!--
-->`).toEqual([
    { text: '<!--', type: 'CommentStart' },
    { text: '\n', type: 'Comment' },
    { text: '-->', type: 'CommentEnd' },
  ])
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: '1', type: 'AttributeValue' },
    { text: '"', type: 'ClosingDoubleQuote' },
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
    { text: '"', type: 'OpeningDoubleQuote' },
    { text: 'preserve', type: 'AttributeValue' },
    { text: '"', type: 'ClosingDoubleQuote' },
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
