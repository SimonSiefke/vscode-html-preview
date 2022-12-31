import { parse } from '../parse/parse2'
import { updateOffsetMap } from '../parse/updateOffsetMap'
import * as NodeType from '../NodeType/NodeType'

export interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
  readonly id: string | number
}

export interface ElementNode {
  readonly nodeType: 'ElementNode'
  readonly id: string | number
  readonly tag: string
  readonly children: readonly (ElementNode | TextNode | CommentNode)[]
  readonly attributes: {
    readonly [key: string]: string | null
  }
}

export interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly id: string | number
  readonly text: string
}

export interface DoctypeNode {
  readonly nodeType: 'Doctype'
  readonly id: number | string
}

type Operation =
  | {
      readonly command: 'elementDelete'
      readonly payload: {
        readonly id: number | string
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number | string
        readonly nodeType: 'ElementNode'
        readonly tag: string
        readonly parentId: number | string
        readonly index: number
        readonly attributes: {
          readonly [attributeName: string]: string | null
        }
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number | string
        readonly nodeType: 'TextNode'
        readonly text: string
        readonly parentId: number | string
        readonly index: number
      }
    }
  | {
      readonly command: 'elementInsert'
      readonly payload: {
        readonly id: number | string
        readonly nodeType: 'CommentNode'
        readonly text: string
        readonly parentId: number | string
        readonly index: number | string
      }
    }
  | {
      readonly command: 'textReplace'
      readonly payload: {
        readonly id: number | string
        readonly text: string
      }
    }
  | {
      readonly command: 'attributeAdd'
      readonly payload: {
        readonly id: number | string
        readonly attributeName: string
        readonly attributeValue: string | null
      }
    }
  | {
      readonly command: 'attributeChange'
      readonly payload: {
        readonly id: number | string
        readonly attributeName: string
        readonly attributeValue: string | null
      }
    }
  | {
      readonly command: 'attributeDelete'
      readonly payload: {
        readonly id: number | string
        readonly attributeName: string
      }
    }
  | {
      readonly command: 'elementMove'
      readonly payload: {
        readonly id: number | string
        readonly index: number
        readonly parentId: number | string
      }
    }

const elementDelete: (
  edits: Operation[],
  node: CommentNode | DoctypeNode | ElementNode | TextNode,
  prepend: boolean
) => void = (edits, node, prepend) => {
  if (prepend) {
    edits.unshift({
      command: 'elementDelete',
      payload: {
        id: node.id,
      },
    })
  } else {
    edits.push({
      command: 'elementDelete',
      payload: {
        id: node.id,
      },
    })
  }
}

const elementMove: (
  edits: Operation[],
  node: CommentNode | ElementNode | TextNode | DoctypeNode,
  parentId: number | string,
  index: number
) => void = (edits, node, parentId, index) => {
  edits.unshift({
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
  parentId: number | string,
  index: number,
  children: boolean
) => void = (edits, node, parentId, index, children) => {
  switch (node.nodeType) {
    case 'Doctype': {
      break
    }
    case NodeType.ElementNode: {
      if (children) {
        edits.push({
          command: 'elementInsert',
          payload: {
            nodeType: node.nodeType,
            id: node.id,
            tag: node.tag,
            parentId,
            index,
            attributes: node.attributes,
          },
        })
        for (let i = 0; i < node.children.length; i++) {
          elementInsert(edits, node.children[i], node.id, i, children)
        }
      } else {
        edits.unshift({
          command: 'elementInsert',
          payload: {
            nodeType: node.nodeType,
            id: node.id,
            tag: node.tag,
            parentId,
            index,
            attributes: node.attributes,
          },
        })
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
  readonly [id: number]: CommentNode | DoctypeNode | ElementNode | TextNode
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
  parentId: number | string
) => void = (edits, oldNodes, newNodes, oldNodeMap, newNodeMap, parentId) => {
  let oldIndex = 0
  let newIndex = 0
  let k = -1

  /**
   * Take care of common nodes
   */
  while (oldIndex < oldNodes.length && newIndex < newNodes.length) {
    if (k++ > 10000) {
      oldIndex
      newIndex
      oldNodes[oldIndex] //?
      newNodes[newIndex] //?
      console.log('force')
      throw new Error('force')
    }
    const oldNode = oldNodes[oldIndex]
    const newNode = newNodes[newIndex]
    if (
      oldNode.nodeType === 'TextNode' &&
      newNode.nodeType === 'TextNode' &&
      oldNode.id === newNode.id
    ) {
      if (oldNode.text !== newNode.text) {
        textReplace(edits, newNode)
      }
      oldIndex++
      newIndex++
    } else if (
      oldNode.nodeType === NodeType.ElementNode &&
      newNode.nodeType === NodeType.ElementNode &&
      oldNode.id === newNode.id
    ) {
      if (oldNode.tag === newNode.tag) {
        attributeEdits(edits, oldNode, newNode)
        childEdits(edits, oldNode.children, newNode.children, oldNodeMap, newNodeMap, newNode.id)
      } else {
        elementDelete(edits, oldNode, false)
        elementInsert(edits, newNode, parentId, newIndex, true)
      }
      oldIndex++
      newIndex++
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
    } else if (oldNode.nodeType === 'Doctype' && newNode.nodeType === 'Doctype') {
      oldIndex++
      newIndex++
    } else if (oldNode.id in newNodeMap) {
      if (newNode.id in oldNodeMap) {
        if (oldNodeMap[newNode.id].nodeType === newNode.nodeType) {
          oldNode
          newNode
          switch (newNode.nodeType) {
            case 'TextNode': {
              if (oldNodeMap[newNode.id].text === newNode.text) {
                oldIndex++
              } else {
                elementDelete(edits, oldNode, false)
                elementInsert(edits, newNode, parentId, newIndex, true)
                oldIndex++
                newIndex++
              }
              break
            }
            case 'CommentNode': {
              if (oldNodeMap[newNode.id].text === newNode.text) {
                newNode
                oldNode
                oldIndex++
              } else {
                elementDelete(edits, oldNode, false)
                elementInsert(edits, newNode, parentId, newIndex, true)
                oldIndex++
                newIndex++
              }
              break
            }
            case NodeType.ElementNode: {
              oldIndex++
              break
            }
          }
        } else {
          elementDelete(edits, oldNode, false)
          elementInsert(edits, newNode, parentId, newIndex, true)
          oldIndex++
          newIndex++
        }
      } else {
        elementInsert(edits, newNode, parentId, newIndex, true)
        newIndex++
      }
    } else {
      elementDelete(edits, oldNode, false)
      oldIndex++
    }
  }
  /**
   * Take care of any remaining nodes in the old tree.
   */
  while (oldIndex < oldNodes.length) {
    const oldNode = oldNodes[oldIndex]
    oldIndex++
    elementDelete(edits, oldNode, true)
  }
  /**
   * Take care of the remaining nodes in the new tree.
   */
  while (newIndex < newNodes.length) {
    const newNode = newNodes[newIndex]
    if (newNode.id in oldNodeMap) {
      const oldNode = oldNodeMap[newNode.id]
      if (newNode.nodeType === NodeType.ElementNode) {
        childEdits(edits, oldNode.children, newNode.children, oldNodeMap, newNode, newNode.id)
      }
      if (newNode.id !== 'html') {
        if (newNode.nodeType === oldNode.nodeType) {
          if (newNode.nodeType === NodeType.ElementNode && oldNode.tag !== newNode.tag) {
            elementInsert(edits, newNode, parentId, newIndex, false)
          } else {
            elementMove(edits, newNode, parentId, newIndex)
          }
        } else {
          throw new Error('no')
        }
      }
    } else {
      elementInsert(edits, newNode, parentId, newIndex, true)
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
let offsetMap = Object.create(null)

let id = 0
const p1 = parse(`<h1>hello world</h1>`, offset => {
  const nextId = id++
  offsetMap[offset] = nextId
  return nextId
})

offsetMap

offsetMap = updateOffsetMap(offsetMap, [
  {
    rangeOffset: 1,
    rangeLength: 19,
    text: 'style>\n\n  p{\n    color:red;\n    padding: 0.5rem;\n\n  border: 1px solid;\n    transform: rotate(-10deg)\n\n  }\n\n  p:nth-child(even){\n      transform: rotate(10deg)\n\n\n  }\n</style>',
  },
])

offsetMap

let newOffsetMap = Object.create(null)

const p2 = parse(
  `<style>

p{
  color:red;
  padding: 0.5rem;

border: 1px solid;
  transform: rotate(-10deg)

}

p:nth-child(even){
    transform: rotate(10deg)


}
</style>`,
  (offset, tokenLength) => {
    let nextId: number
    nextId: if (offset in offsetMap) {
      nextId = offsetMap[offset]
    } else {
      for (let i = offset + 1; i < offset + tokenLength; i++) {
        if (i in offsetMap) {
          nextId = offsetMap[i]
          break nextId
        }
      }
      nextId = id++
    }
    newOffsetMap[offset] = nextId
    return nextId
  }
)
if (p1.status === 'success' && p2.status === 'success') {
  JSON.stringify(p1.nodes, null, 2) //?
  JSON.stringify(p2.nodes, null, 2) //?
  const edits = diff(p1, p2)
  const expectedEdits = [
    {
      command: 'textReplace',
      payload: {
        text: 'b',
      },
    },
  ]
  edits //?
}
