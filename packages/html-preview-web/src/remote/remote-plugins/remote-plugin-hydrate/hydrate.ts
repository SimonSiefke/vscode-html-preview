function walk(dom, fn, childrenFirst = false) {
  if (Array.isArray(dom)) {
    return dom.map(d => walk(d, fn, childrenFirst))
  }

  if (!childrenFirst) {
    fn(dom)
  }

  if (dom.children) {
    walk(dom.children, fn, childrenFirst)
  }

  if (childrenFirst) {
    fn(dom)
  }

  return dom
}

function validate(node: any, $actualNode: Node) {
  if (!$actualNode) {
    alert('failed to hydrate dom (0)')
    console.error('$actualNode is undefined')
  }

  if (
    node.nodeType === 'TextNode' &&
    ($actualNode.nodeType !== Node.TEXT_NODE ||
      (($actualNode as Text).data !== node.text &&
        // special case: check for new line because the html-preview script is inserted together with a new line and the new line becomes part of the previous text node inside the body
        ($actualNode as Text).data !== node.text + '\n'))
  ) {
    console.log(`expected text node with text ${node.text}, got`)
    console.error('(1) invalid', $actualNode)
    alert('error, failed to hydrate dom (1)')
  } else if (
    node.nodeType === 'ElementNode' &&
    node.tag.toLowerCase() === '!doctype' &&
    $actualNode.nodeType !== Node.DOCUMENT_TYPE_NODE
  ) {
    console.log('expected doctype node, got')
    console.error('(2) invalid', $actualNode)
    alert('error, failed to hydrate dom (2)')
  } else if (
    node.nodeType === 'ElementNode' &&
    node.tag.toLowerCase() === 'html' &&
    $actualNode !== document.documentElement
  ) {
    console.log('expected html node, got')
    console.error('(3) invalid', $actualNode)
    alert('error, failed to hydrate dom (3)')
  } else if (
    node.nodeType === 'ElementNode' &&
    node.tag.toLowerCase() === 'body' &&
    $actualNode !== document.body
  ) {
    console.log('expected body node, got')
    console.error('(4) invalid', $actualNode)
    alert('error, failed to hydrate dom (4)')
  } else if (
    node.nodeType === 'ElementNode' &&
    node.tag.toLowerCase() === 'head' &&
    $actualNode !== document.head
  ) {
    console.log('expected head node, got')
    console.error('(5) invalid', $actualNode)
    alert('error, failed to hydrate dom (5)')
  } else if (
    node.nodeType === 'ElementNode' &&
    !['html', 'body', 'head', '!doctype'].includes(node.tag.toLowerCase()) &&
    $actualNode.nodeType !== Node.ELEMENT_NODE
  ) {
    console.log(`expected element node with tag ${node.tag}, got`)
    console.error('(6) invalid', $actualNode)
    alert('error, failed to hydrate dom (6)')
  } else if (
    node.nodeType === 'CommentNode' &&
    ($actualNode.nodeType !== Node.COMMENT_NODE || node.text !== ($actualNode as Comment).data)
  ) {
    console.log('expected comment node, got')
    console.error('(7) invalid', $actualNode)
    alert('error, failed to hydrate dom (7)')
  }
}

function isUsuallyInHead(node) {
  const nodesThatAreUsuallyInHead = ['style', 'title', 'link', 'meta']
  return node.nodeType === 'ElementNode' && nodesThatAreUsuallyInHead.includes(node.tag)
}

export const hydrate = (virtualDom: any) => {
  const nodeMap = { 0: document }
  if (virtualDom === 'invalid') {
    return {
      error: 'invalid',
    }
  }
  let domIndex = 0
  let inBody = false
  let hasBody = false
  let hasHtml = false
  let hasHead = false
  let hasText = false
  for (const node of virtualDom) {
    if (node.tag === 'html') {
      hasHtml = true
    } else if (node.tag === 'body') {
      hasBody = true
    } else if (node.tag === 'head') {
      hasHead = true
    } else if (node.nodeType === 'Text' && !node.text.trim()) {
      hasText = true
    }
  }

  let hadBody = false
  let hadHtml = false
  let hadHead = false
  let hadText = false
  for (const node of virtualDom) {
    if (node.tag === 'html') {
      if (hadHtml || hasBody || hasHead || hasText) {
        alert('invalid dom')
      } else {
        hadHtml = true
      }
    } else if (node.tag === 'body') {
      if (hadBody || hasHtml || hasText) {
        alert('invalid dom')
      } else {
        hadBody = true
      }
    } else if (node.tag === 'head') {
      if (hadBody || hadHead || hasHtml || hadText) {
        alert('invalid dom')
      } else {
        hadHead = true
      }
    } else if (node.nodeType === 'Text' && !node.text.trim()) {
      if (hasBody || hasHtml) {
        alert('invalid dom')
      } else {
        hadText = true
      }
    }
  }

  let $root = document as Node
  let inHtml = false
  hadBody = false
  hadHead = false
  hadText = false
  hadHtml = false

  for (let i = 0; i < virtualDom.length; i++) {
    const node = virtualDom[i]

    if (node.tag === 'html') {
      hadHtml = true
    } else if (node.tag === 'body') {
      hadBody = true
    } else if (node.tag === 'head') {
      hadHead = true
    } else if (node.nodeType === 'Text' && !node.text.trim()) {
      hadText = true
    }

    // must ignore whitespace nodes at top level
    if (!inBody && node.nodeType === 'TextNode' && (!hadHead || hadBody) && !node.text.trim()) {
      continue
    }

    if (node.tag === 'body' && !inHtml) {
      $root = document.documentElement
      domIndex = 1 // because of implicit head tag
    } else if (node.tag === 'head') {
      $root = document.documentElement
      domIndex = 0
      inHtml = true
      // const nextNode = virtualDom[i + 1];
      // special case: whitespace after head is ignored when the next node is a text node
      // if (nextNode && nextNode.nodeType === 'TextNode') {
      // 	nextNode.text = nextNode.text.trimStart();
      // }
    } else if (
      node.nodeType === 'CommentNode' ||
      (node.nodeType === 'TextNode' && !node.text.trim())
    ) {
      // comment nodes are allowed between head and body
      // whitespace text nodes are allowed between head and body
      // do nothing special
      // } else if (!inBody && !hasHtml && !hasHead && isUsuallyInHead(node)) {
      // implicit head
      // TODO
    } else if (!hasBody && !hasHtml && !inBody) {
      // if another node appears it will mark the implicit beginning of the body
      inBody = true
      $root = document.body
      domIndex = 0
    }

    const $node = $root.childNodes[domIndex]
    nodeMap[node.id] = $node
    domIndex++
    validate(node, $node)
  }

  // const ignoredTags
  walk(virtualDom, node => {
    if (node.nodeType !== 'ElementNode' || node.tag === '!doctype' || node.tag === '!DOCTYPE') {
      return
    }

    const $node = document.querySelector(`[data-id='${node.id}']`) as HTMLElement
    // @debug
    if (!$node && node.tag.toLowerCase() !== '!doctype') {
      console.error(node)
      console.error(node.id, $node)
      // debugger
      alert('error, failed to hydrate dom (9)')
    }

    $node.removeAttribute('data-id') // TODO remove this while debugging

    nodeMap[node.id] = $node
    const $children = $node.childNodes
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (child.nodeType === 'TextNode') {
        nodeMap[child.id] = $children[i]
      }

      if (child.nodeType === 'CommentNode') {
        nodeMap[child.id] = $children[i]
      }
    }
  })
  return { nodeMap, hasBody, hasHead, hasHtml, virtualDom }
}
