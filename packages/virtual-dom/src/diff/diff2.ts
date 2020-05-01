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
        readonly parentId: number
        readonly index: number
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number
        readonly nodeType: 'TextNode'
        readonly text: string
        readonly parentId: number
        readonly index: number
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number
        readonly nodeType: 'CommentNode'
        readonly text: string
        readonly parentId: number
        readonly index: number
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
  | {
      readonly command: 'elementMove'
      readonly payload: {
        readonly id: number
        readonly index: number
        readonly parentId: number
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

const elementMove: (
  edits: Operation[],
  node: CommentNode | ElementNode | TextNode | DoctypeNode,
  parentId: number,
  index: number
) => void = (edits, node, parentId, index) => {
  edits.push({
    command: 'elementMove',
    payload: {
      id: node.id,
      parentId,
      index,
    },
  })
}

const elementInsert: (
  edits: Operation[],
  node: CommentNode | DoctypeNode | ElementNode | TextNode,
  parentId: number,
  index: number
) => void = (edits, node, parentId, index) => {
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
          parentId,
          index,
        },
      })
      for (let i = 0; i < node.children.length; i++) {
        elementInsert(edits, node.children[i], node.id, i)
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
          parentId,
          index,
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
          parentId,
          index,
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
  newNodeMap: any,
  parentId: number
) => void = (edits, oldNodes, newNodes, oldNodeMap, newNodeMap, parentId) => {
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
      childEdits(edits, oldNode.children, newNode.children, oldNodeMap, newNodeMap, newNode.id)
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
      elementInsert(edits, newNode, parentId, newIndex)
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
    if (newNode.id in oldNodeMap) {
      elementMove(edits, newNode, parentId, newIndex)
    } else {
      elementInsert(edits, newNode, parentId, newIndex)
    }
    newIndex++
  }
  return edits
}

export const diff: (oldState: State, newState: State) => readonly Operation[] = (
  oldState,
  newState
) => {
  const edits: Operation[] = []
  childEdits(edits, oldState.nodes, newState.nodes, oldState.nodeMap, newState.nodeMap, -1)
  return edits
}

const oldNodes = [
  {
    tag: 'p',
    nodeType: 'ElementNode',
    id: 0,
    attributes: {},
    children: [
      {
        nodeType: 'TextNode',
        text: '\n  Hello\n',
        id: 1,
      },
    ],
  },
  {
    text: '\n',
    nodeType: 'TextNode',
    id: 2,
  },
  {
    nodeType: 'ElementNode',
    attributes: {},
    id: 3,
    tag: 'p',
    children: [
      {
        nodeType: 'TextNode',
        text: '\n  ',
        id: 4,
      },
      {
        nodeType: 'ElementNode',
        tag: 'em',
        id: 5,
        attributes: {},
        children: [
          {
            nodeType: 'TextNode',
            text: 'World',
            id: 6,
          },
        ],
      },
      {
        nodeType: 'TextNode',
        text: '\n\n',
        id: 7,
      },
    ],
  },
] as const

const newNodes = [
  {
    tag: 'p',
    nodeType: 'ElementNode',
    id: 0,
    attributes: {},
    children: [
      {
        nodeType: 'TextNode',
        text: '\n  Hello\n\n    ',
        id: 1,
      },
      {
        nodeType: 'ElementNode',
        tag: 'em',
        id: 5,
        attributes: {},
        children: [
          {
            nodeType: 'TextNode',
            text: 'World',
            id: 6,
          },
        ],
      },
      {
        nodeType: 'TextNode',
        text: '\n\n',
        id: 7,
      },
    ],
  },
] as const
const oldNodeMap = {
  0: oldNodes[0],
  1: oldNodes[0].children[0],
  2: oldNodes[1],
  3: oldNodes[2],
  4: oldNodes[2].children[0],
  5: oldNodes[2].children[1],
  6: oldNodes[2].children[1].children[0],
  7: oldNodes[2].children[2],
}
const newNodeMap = {
  0: newNodes[0],
  1: newNodes[0].children[0],
  5: newNodes[0].children[1],
  6: newNodes[0].children[1].children[0],
  7: newNodes[0].children[2],
}

diff({ nodes: oldNodes, nodeMap: oldNodeMap }, { nodes: newNodes, nodeMap: newNodeMap }) //?