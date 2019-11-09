import { Parser } from 'virtual-dom'

export function genDom(orig, parser: Parser) {
  const dom = parser.parse(orig).htmlDocument
  if (dom === undefined) {
    console.log('no 1')
    return { gen: orig }
  }
  let gen = ''
  console.log('2')
  let lastIndex = 0
  // parser.dom;
  // // @ts-ignore
  // const {htmlDocument: dom, error} = parseHtml(orig); // ?
  // if (error) {
  // 	throw error;
  // }

  // Walk through the dom nodes and insert the 'data-brackets-id' attribute at the
  // end of the open tag
  let prefixSum = 0
  function walk(node) {
    prefixSum += node.start
    if (node.nodeType === 'ElementNode' && node.tag.toLowerCase() !== '!doctype') {
      const attrText = ` data-id="${node.id}"`
      lastIndex
      prefixSum

      // Insert the attribute as the first attribute in the tag.
      const insertIndex = prefixSum + node.tag.length + 1
      gen += orig.substr(lastIndex, insertIndex - lastIndex) + attrText
      lastIndex = insertIndex
    }

    if (node.nodeType === 'ElementNode') {
      node.children.forEach(walk)
    }
  }

  dom.children.forEach(walk)
  gen += orig.substr(lastIndex)
  return {
    gen,
    dom,
  }
}
