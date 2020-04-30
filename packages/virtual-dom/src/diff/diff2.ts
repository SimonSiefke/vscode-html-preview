export interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
  readonly id: number
}

export interface ElementNode {
  readonly nodeType: 'ElementNode'
  readonly id: number
  readonly tag: string
  readonly children: readonly (ElementNode | TextNode | CommentNode)[]
  readonly attributes: {
    readonly [key: string]: string | null
  }
}

export interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly id: number
  readonly text: string
}

export interface DoctypeNode {
  readonly nodeType: 'Doctype'
  readonly id: number
}

type Operation =
  | {
      readonly command: 'elementDelete'
      readonly payload: {
        readonly id: number
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number
        readonly nodeType: 'ElementNode'
        readonly tag: string
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number
        readonly nodeType: 'TextNode'
        readonly text: string
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number
        readonly nodeType: 'CommentNode'
        readonly text: string
      }
    }
  | {
      readonly command: 'textReplace'
      readonly payload: {
        readonly id: number
        readonly text: string
      }
    }
  | {
      readonly command: 'attributeAdd'
      readonly payload: {
        readonly id: number
        readonly attributeName: string
        readonly attributeValue: string | null
      }
    }
  | {
      readonly command: 'attributeChange'
      readonly payload: {
        readonly id: number
        readonly attributeName: string
        readonly attributeValue: string | null
      }
    }
  | {
      readonly command: 'attributeDelete'
      readonly payload: {
        readonly id: number
        readonly attributeName: string
      }
    }

const elementDelete: (
  edits: Operation[],
  node: CommentNode | DoctypeNode | ElementNode | TextNode
) => void = (edits, node) => {
  edits.push({
    command: 'elementDelete',
    payload: {
      id: node.id,
    },
  })
}

const elementInsert: (
  edits: Operation[],
  node: CommentNode | DoctypeNode | ElementNode | TextNode
) => void = (edits, node) => {
  switch (node.nodeType) {
    case 'Doctype': {
      break
    }
    case 'ElementNode': {
      edits.push({
        command: 'elementInsert',
        payload: {
          nodeType: node.nodeType,
          id: node.id,
          tag: node.tag,
        },
      })
      for (const child of node.children) {
        elementInsert(edits, child)
      }
      break
    }
    case 'TextNode': {
      edits.push({
        command: 'elementInsert',
        payload: {
          nodeType: node.nodeType,
          id: node.id,
          text: node.text,
        },
      })
      break
    }
    case 'CommentNode': {
      edits.push({
        command: 'elementInsert',
        payload: {
          nodeType: node.nodeType,
          id: node.id,
          text: node.text,
        },
      })
      break
    }
  }
}

const textReplace: (edits: Operation[], node: CommentNode | TextNode) => void = (edits, node) => {
  edits.push({
    command: 'textReplace',
    payload: {
      id: node.id,
      text: node.text,
    },
  })
}

const attributeAdd: (
  edits: Operation[],
  node: ElementNode,
  attributeName: string,
  attributeValue: string | null
) => void = (edits, node, attributeName, attributeValue) => {
  edits.push({
    command: 'attributeAdd',
    payload: {
      id: node.id,
      attributeName,
      attributeValue,
    },
  })
}

const attributeChange: (
  edits: Operation[],
  node: ElementNode,
  attributeName: string,
  attributeValue: string | null
) => void = (edits, node, attributeName, attributeValue) => {
  edits.push({
    command: 'attributeChange',
    payload: {
      id: node.id,
      attributeName,
      attributeValue,
    },
  })
}

const attributeDelete: (edits: Operation[], node: ElementNode, attributeName: string) => void = (
  edits,
  node,
  attributeName
) => {
  edits.push({
    command: 'attributeDelete',
    payload: {
      id: node.id,
      attributeName,
    },
  })
}

const attributeEdits: (edits: Operation[], oldNode: ElementNode, newNode: ElementNode) => void = (
  edits,
  oldNode,
  newNode
) => {
  const oldAttributes = oldNode.attributes
  const newAttributes = newNode.attributes
  for (const oldAttribute in oldAttributes) {
    if (!(oldAttribute in newAttributes)) {
      attributeDelete(edits, newNode, oldAttribute)
    } else if (oldAttributes[oldAttribute] !== newAttributes[oldAttribute]) {
      attributeChange(edits, newNode, oldAttribute, newAttributes[oldAttribute])
    }
  }
  for (const newAttribute in newAttributes) {
    if (!(newAttribute in oldAttributes)) {
      attributeAdd(edits, newNode, newAttribute, newAttributes[newAttribute])
    }
  }
}

interface NodeMap {
  readonly [id: number]: any
}

export interface State {
  readonly nodes: readonly (CommentNode | DoctypeNode | ElementNode | TextNode)[]
  readonly nodeMap: NodeMap
}

const childEdits: (
  edits: Operation[],
  oldNodes: readonly (CommentNode | DoctypeNode | ElementNode | TextNode)[],
  newNodes: readonly (CommentNode | DoctypeNode | ElementNode | TextNode)[],
  oldNodeMap: any,
  newNodeMap: any
) => void = (edits, oldNodes, newNodes, oldNodeMap, newNodeMap) => {
  let oldIndex = 0
  let newIndex = 0
  /**
   * Take care of common nodes
   */
  while (oldIndex < oldNodes.length && newIndex < newNodes.length) {
    const oldNode = oldNodes[oldIndex]
    const newNode = newNodes[newIndex]
    if (
      oldNode.nodeType === 'TextNode' &&
      newNode.nodeType === 'TextNode' &&
      oldNode.id === newNode.id
    ) {
      if (oldNode.text !== newNode.text) {
        textReplace(edits, newNode)
        oldIndex++
        newIndex++
        continue
      }
    } else if (
      oldNode.nodeType === 'ElementNode' &&
      newNode.nodeType === 'ElementNode' &&
      oldNode.id === newNode.id
    ) {
      attributeEdits(edits, oldNode, newNode)
      childEdits(edits, oldNode.children, newNode.children, oldNodeMap, newNodeMap)
      // attributeAdd()
      oldIndex++
      newIndex++
      continue
    } else if (
      oldNode.nodeType === 'CommentNode' &&
      newNode.nodeType === 'CommentNode' &&
      oldNode.id === newNode.id
    ) {
      if (oldNode.text !== newNode.text) {
        textReplace(edits, newNode)
      }
      oldIndex++
      newIndex++
      continue
    }
    if (!newNodeMap[oldNode.id]) {
      elementDelete(edits, oldNode)
      oldIndex++
    }
    if (!oldNodeMap[newNode.id]) {
      elementInsert(edits, newNode)
      newIndex++
    }
  }
  /**
   * Take care of any remaining nodes in the old tree.
   */
  while (oldIndex < oldNodes.length) {
    const oldNode = oldNodes[oldIndex]
    oldIndex++
    elementDelete(edits, oldNode)
  }
  /**
   * Take care of the remaining nodes in the new tree.
   */
  while (newIndex < newNodes.length) {
    const newNode = newNodes[newIndex]
    newIndex++
    elementInsert(edits, newNode)
  }
  return edits
}

export const diff: (oldState: State, newState: State) => readonly Operation[] = (
  oldState,
  newState
) => {
  const edits: Operation[] = []
  childEdits(edits, oldState.nodes, newState.nodes, oldState.nodeMap, newState.nodeMap)
  return edits
}

// const node0: CommentNode = { nodeType: 'CommentNode', text: 'h1', id: 0 }
// const node1: CommentNode = { nodeType: 'CommentNode', text: 'h12', id: 0 }

// const oldNodeMap = {
//   0: node0,
// }
// const newNodeMap = {
//   0: node1,
// }

// diff({ nodes: [node0], nodeMap: oldNodeMap }, { nodes: [node1], nodeMap: newNodeMap }) //?

const node0: ElementNode = {
  nodeType: 'ElementNode',
  children: [
    {
      nodeType: 'TextNode',
      text: 'hello world',
      id: 1,
    },
  ],
  id: 0,
  tag: 'h1',
  attributes: {},
}

const node1: ElementNode = {
  nodeType: 'ElementNode',
  children: [
    {
      nodeType: 'TextNode',
      text: 'hello world!',
      id: 1,
    },
  ],
  id: 0,
  tag: 'h1',
  attributes: {},
}

const oldNodeMap = {
  0: node0,
}
const newNodeMap = {
  1: node1,
}

// for (let i = 0; i < 1000; i++) {
diff({ nodes: [node0], nodeMap: oldNodeMap }, { nodes: [node1], nodeMap: newNodeMap }) //?.
// }
