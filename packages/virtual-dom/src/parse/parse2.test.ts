test.skip('', () => {})
// import { parse as _parse } from './parse2'

// const parse = (text: string) =>
//   _parse(
//     text,
//     (() => {
//       let id = 0
//       return () => id++
//     })()
//   )

// const pretty = node => {
//   if (node.nodeType === 'ElementNode') {
//     return {
//       tag: node.tag,
//       children: node.children.map(pretty),
//       id: node.id,
//       attributes: node.attributes,
//     }
//   }

//   return {
//     nodeType: node.nodeType,
//     text: node.text,
//     id: node.id,
//   }
// }

// const expectNodes = (text: string) => ({
//   toEqual: (expectedNodes: any) => {
//     const result = parse(text)
//     expect(result.status).toBe('success')
//     expect((result as any).nodes).toEqual(expectedNodes)
//   },
//   toFail: () => {
//     const result = parse(text)
//     expect(result.status).toBe('invalid')
//   },
// })

// test('basic', () => {
//   expectNodes(`<h1>hello world</h1>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'h1',
//       id: 0,
//       attributes: {},
//       children: [
//         {
//           nodeType: 'TextNode',
//           text: 'hello world',
//           id: 1,
//         },
//       ],
//     },
//   ])
// })

// test('self closing tag', () => {
//   expectNodes(`<br>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'br',
//       id: 0,
//       attributes: {},
//       children: [],
//     },
//   ])
// })

// test('attribute', () => {
//   expectNodes(`<h1 class="big"></h1>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'h1',
//       id: 0,
//       attributes: { class: 'big' },
//       children: [],
//     },
//   ])
// })

// test('attribute without value', () => {
//   expectNodes(`<h1 class></h1>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'h1',
//       id: 0,
//       attributes: { class: null },
//       children: [],
//     },
//   ])
// })

// test('comment', () => {
//   expectNodes(`<!---->`).toEqual([{ nodeType: 'CommentNode', id: 0, text: '' }])
// })

// test('embedded script', () => {
//   expectNodes(`<script>
// for(var b=0;b<a.length;++b){
// </script>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'script',
//       id: 0,
//       attributes: {},
//       children: [{ nodeType: 'TextNode', id: 1, text: '\nfor(var b=0;b<a.length;++b){\n' }],
//     },
//   ])
// })

// test('embedded style', () => {
//   expectNodes(`<style>
// body {
//   font-size: 24px; /* apply to <body> */
// }
// </style>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'style',
//       attributes: {},
//       id: 0,
//       children: [
//         {
//           nodeType: 'TextNode',
//           id: 1,
//           text: '\nbody {\n  font-size: 24px; /* apply to <body> */\n}\n',
//         },
//       ],
//     },
//   ])
// })

// test('older doctype', () => {
//   expectNodes(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
//   <html xmlns="http://www.w3.org/1999/xhtml" dir="ltr"  lang="en-US" ></html>`).toEqual([
//     { nodeType: 'Doctype', tag: '!DOCTYPE' },
//     { nodeType: 'TextNode', id: 0, text: '\n  ' },
//     {
//       nodeType: 'ElementNode',
//       id: 1,
//       tag: 'html',
//       attributes: { dir: 'ltr', lang: 'en-US', xmlns: 'http://www.w3.org/1999/xhtml' },
//       children: [],
//     },
//   ])
// })

// test('invalid doctype', () => {
//   expectNodes(`<!DOCTYPE ht>`).toFail()
// })

// test('small document', () => {
//   expectNodes(`<!DOCTYPE html>
// <html>
//   <head>
//     <base href=http://www.example.com/ target=_self />
//   </head>
//   <body>
//     asdasdasdasdasdasd
//   </body>
// </html>`).toEqual([
//     { nodeType: 'Doctype', tag: '!DOCTYPE' },
//     { nodeType: 'TextNode', id: 0, text: '\n' },
//     {
//       nodeType: 'ElementNode',
//       id: 1,
//       tag: 'html',
//       attributes: {},
//       children: [
//         { nodeType: 'TextNode', id: 2, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 3,
//           tag: 'head',
//           attributes: {},
//           children: [
//             { nodeType: 'TextNode', id: 4, text: '\n    ' },
//             {
//               attributes: { href: 'http://www.example.com/', target: '_self' },
//               children: [],
//               nodeType: 'ElementNode',
//               tag: 'base',
//               id: 5,
//             },
//             { nodeType: 'TextNode', id: 6, text: '\n  ' },
//           ],
//         },
//         { nodeType: 'TextNode', id: 7, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 8,
//           tag: 'body',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 9, text: '\n    asdasdasdasdasdasd\n  ' }],
//         },
//         { nodeType: 'TextNode', id: 10, text: '\n' },
//       ],
//     },
//   ])
// })

// test('unmatched tags', () => {
//   expectNodes(`<h1></h2>`).toFail()
// })

// test('multiline start tag', () => {
//   expectNodes(`<h1
// >hello world</h1>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       id: 0,
//       tag: 'h1',
//       attributes: {},
//       children: [{ nodeType: 'TextNode', id: 1, text: 'hello world' }],
//     },
//   ])
// })

// test('partial start tag', () => {
//   expectNodes(`<h1 class`).toFail()
// })

// test('unclosed tag', () => {
//   expectNodes(`<h1>hello world`).toFail()
// })

// test('partial end tag', () => {
//   expectNodes(`<h1 class></h1`).toFail()
// })

// test('unclosed li tag in unordered list', () => {
//   expectNodes(`<ul>
//   <li>1
//   <li>2
// </ul>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'ul',
//       id: 0,
//       attributes: {},
//       children: [
//         { nodeType: 'TextNode', id: 1, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 2,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 3, text: '1\n  ' }],
//         },
//         {
//           nodeType: 'ElementNode',
//           id: 4,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 5, text: '2\n' }],
//         },
//       ],
//     },
//   ])
// })

// test('unclosed li tag in ordered list', () => {
//   expectNodes(`<ol>
//   <li>1
//   <li>2
// </ol>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       id: 0,
//       tag: 'ol',
//       attributes: {},
//       children: [
//         { nodeType: 'TextNode', id: 1, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 2,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 3, text: '1\n  ' }],
//         },
//         {
//           nodeType: 'ElementNode',
//           id: 4,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 5, text: '2\n' }],
//         },
//       ],
//     },
//   ])
// })

// test('two lists', () => {
//   expectNodes(`<ul>
//   <li>1
//   <li>2
// </ul>
// <ul>
//   <li>1
//   <li>2
// </ul>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       id: 0,
//       tag: 'ul',
//       attributes: {},
//       children: [
//         { nodeType: 'TextNode', id: 1, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 2,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 3, text: '1\n  ' }],
//         },
//         {
//           nodeType: 'ElementNode',
//           id: 4,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 5, text: '2\n' }],
//         },
//       ],
//     },
//     { nodeType: 'TextNode', id: 6, text: '\n' },
//     {
//       nodeType: 'ElementNode',
//       id: 7,
//       tag: 'ul',
//       attributes: {},
//       children: [
//         { nodeType: 'TextNode', id: 8, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           id: 9,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 10, text: '1\n  ' }],
//         },
//         {
//           nodeType: 'ElementNode',
//           id: 11,
//           tag: 'li',
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 12, text: '2\n' }],
//         },
//       ],
//     },
//   ])
// })

// test('invalid self-closing tag', () => {
//   expectNodes('<div />').toFail()
// })

// test('valid self-closing tag', () => {
//   expectNodes(`<br />`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       id: 0,
//       tag: 'br',
//       attributes: {},
//       children: [],
//     },
//   ])
// })

// test('another small document', () => {
//   expectNodes(`<!DOCTYPE html>
//   <html lang="en">
//   <head>
//   </head>
//   </html>`).toEqual([
//     { nodeType: 'Doctype', tag: '!DOCTYPE' },
//     { nodeType: 'TextNode', id: 0, text: '\n  ' },
//     {
//       nodeType: 'ElementNode',
//       tag: 'html',
//       id: 1,
//       attributes: { lang: 'en' },
//       children: [
//         { nodeType: 'TextNode', id: 2, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           tag: 'head',
//           id: 3,
//           attributes: {},
//           children: [{ nodeType: 'TextNode', id: 4, text: '\n  ' }],
//         },
//         { nodeType: 'TextNode', id: 5, text: '\n  ' },
//       ],
//     },
//   ])
// })

// test('svg', () => {
//   expectNodes(`<svg class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28" aria-hidden="true">
//   <path d="M23 15a2.01 2.01 0 0 1-.578 1.422L12.25 26.594c-.375.359-.891.578-1.422.578s-1.031-.219-1.406-.578L8.25 25.422c-.375-.375-.594-.891-.594-1.422s.219-1.047.594-1.422L12.828 18h-11C.703 18 0 17.062 0 16v-2c0-1.062.703-2 1.828-2h11L8.25 7.406a1.96 1.96 0 0 1 0-2.812l1.172-1.172c.375-.375.875-.594 1.406-.594s1.047.219 1.422.594l10.172 10.172c.375.359.578.875.578 1.406z"/>
//   </svg>`).toEqual([
//     {
//       nodeType: 'ElementNode',
//       tag: 'svg',
//       id: 0,
//       attributes: {
//         'aria-hidden': 'true',
//         class: 'icon icon-arrow',
//         height: '28',
//         viewBox: '0 0 23 28',
//         width: '23',
//         xmlns: 'http://www.w3.org/2000/svg',
//       },
//       children: [
//         { nodeType: 'TextNode', id: 1, text: '\n  ' },
//         {
//           nodeType: 'ElementNode',
//           tag: 'path',
//           id: 2,
//           attributes: {
//             d:
//               'M23 15a2.01 2.01 0 0 1-.578 1.422L12.25 26.594c-.375.359-.891.578-1.422.578s-1.031-.219-1.406-.578L8.25 25.422c-.375-.375-.594-.891-.594-1.422s.219-1.047.594-1.422L12.828 18h-11C.703 18 0 17.062 0 16v-2c0-1.062.703-2 1.828-2h11L8.25 7.406a1.96 1.96 0 0 1 0-2.812l1.172-1.172c.375-.375.875-.594 1.406-.594s1.047.219 1.422.594l10.172 10.172c.375.359.578.875.578 1.406z',
//           },
//           children: [],
//         },
//         { nodeType: 'TextNode', id: 3, text: '\n  ' },
//       ],
//     },
//   ])
// })
