import { parse } from './parse2'

const pretty = node => {
  if (node.nodeType === 'ElementNode') {
    return {
      tag: node.tag,
      children: node.children.map(pretty),
      id: node.id,
      attributes: node.attributes,
    }
  }

  return {
    nodeType: node.nodeType,
    text: node.text,
    id: node.id,
  }
}

const expectNodes = (text: string) => ({
  toEqual: (expectedNodes: any) => {
    const result = parse(text)
    expect(result.status).toBe('success')
    expect((result as any).nodes).toEqual(expectedNodes)
  },
  toFail: () => {
    const result = parse(text)
    expect(result.status).toBe('invalid')
  },
})

test('basic', () => {
  expectNodes(`<h1>hello world</h1>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'h1',
      parent: undefined,
      attributes: {},
      children: [
        {
          nodeType: 'TextNode',
          text: 'hello world',
          parent: undefined,
        },
      ],
    },
  ])
})

test('self closing tag', () => {
  expectNodes(`<br>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'br',
      parent: undefined,
      attributes: {},
      children: [],
    },
  ])
})

test('attribute', () => {
  expectNodes(`<h1 class="big"></h1>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'h1',
      parent: undefined,
      attributes: { class: 'big' },
      children: [],
    },
  ])
})

test('attribute without value', () => {
  expectNodes(`<h1 class></h1>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'h1',
      parent: undefined,
      attributes: { class: null },
      children: [],
    },
  ])
})

test('comment', () => {
  expectNodes(`<!---->`).toEqual([{ nodeType: 'CommentNode', parent: undefined, text: '' }])
})

test('embedded script', () => {
  expectNodes(`<script>
for(var b=0;b<a.length;++b){
</script>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'script',
      parent: undefined,
      attributes: {},
      children: [
        { nodeType: 'TextNode', parent: undefined, text: '\nfor(var b=0;b<a.length;++b){\n' },
      ],
    },
  ])
})

test('embedded style', () => {
  expectNodes(`<style>
body {
  font-size: 24px; /* apply to <body> */
}
</style>`).toEqual([
    {
      nodeType: 'ElementNode',
      tag: 'style',
      attributes: {},
      parent: undefined,
      children: [
        {
          nodeType: 'TextNode',
          parent: undefined,
          text: '\nbody {\n  font-size: 24px; /* apply to <body> */\n}\n',
        },
      ],
    },
  ])
})

test('older doctype', () => {
  expectNodes(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" dir="ltr"  lang="en-US" >`).toEqual([
    { nodeType: 'Doctype', tag: '!DOCTYPE' },
    { nodeType: 'TextNode', parent: undefined, text: '\n  ' },
    {
      attributes: { dir: 'ltr', lang: 'en-US', xmlns: 'http://www.w3.org/1999/xhtml' },
      children: [],
      nodeType: 'ElementNode',
      parent: undefined,
      tag: 'html',
    },
  ])
})

test('invalid doctype', () => {
  expectNodes(`<!DOCTYPE ht>`).toFail()
})

test('small document', () => {
  expectNodes(`<!DOCTYPE html>
<html>
  <head>
    <base href=http://www.example.com/ target=_self />
  </head>
  <body>
    asdasdasdasdasdasd
  </body>
</html>`).toEqual([
    { nodeType: 'Doctype', tag: '!DOCTYPE' },
    { nodeType: 'TextNode', text: '\n' },
    {
      attributes: {},
      children: [
        { nodeType: 'TextNode', text: '\n  ' },
        {
          attributes: {},
          children: [
            { nodeType: 'TextNode', text: '\n    ' },
            {
              attributes: { href: 'http://www.example.com/', target: '_self' },
              children: [],
              nodeType: 'ElementNode',
              tag: 'base',
            },
            { nodeType: 'TextNode', text: '\n  ' },
          ],
          nodeType: 'ElementNode',
          tag: 'head',
        },
        { nodeType: 'TextNode', text: '\n  ' },
        {
          attributes: {},
          children: [{ nodeType: 'TextNode', text: '\n    asdasdasdasdasdasd\n  ' }],
          nodeType: 'ElementNode',
          tag: 'body',
        },
        { nodeType: 'TextNode', text: '\n' },
      ],
      nodeType: 'ElementNode',
      tag: 'html',
    },
  ])
})
