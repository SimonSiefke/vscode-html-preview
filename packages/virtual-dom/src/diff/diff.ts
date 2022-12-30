import { createParser } from '../parse/parse'
import * as NodeType from '../NodeType/NodeType'
// TODO optimize all this spaghetti code

/**
 * Determines the changes made to attributes and generates edits for those changes.
 *
 * @param oldNode - node from old tree
 * @param newNode - node from new tree
 * @return list of edits to mutate attributes from the old node to the new
 */
function attributeEdits(oldNode: { attributes: any; id: any }, newNode: { attributes: any }) {
  const oldAttributes = { ...oldNode.attributes }
  const newAttributes = newNode.attributes
  oldAttributes
  newAttributes
  const edits: any[] = []

  for (const attributeName of Object.keys(newAttributes)) {
    if (
      Object.prototype.hasOwnProperty.call(oldAttributes, attributeName) !==
        Object.prototype.hasOwnProperty.call(newAttributes, attributeName) ||
      oldAttributes[attributeName] !== newAttributes[attributeName]
    ) {
      const type = Object.prototype.hasOwnProperty.call(oldAttributes, attributeName)
        ? 'attributeChange'
        : 'attributeAdd'
      edits.push({
        command: type,
        payload: {
          id: oldNode.id,
          attribute: attributeName,
          value: newAttributes[attributeName],
        },
      })
    }

    delete oldAttributes[attributeName]
  }

  for (const attributeName of Object.keys(oldAttributes)) {
    edits.push({
      command: 'attributeDelete',
      payload: {
        id: oldNode.id,
        attribute: attributeName,
      },
    })
  }

  return edits
}

function elementDelete(node: { id: any }) {
  return {
    command: 'elementDelete',
    payload: {
      id: node.id,
    },
  }
}

const oldNodeHasMoved = (oldNode, newNodeMap) => {
  const oldNodeInNewTree = newNodeMap[oldNode.id]
  return oldNodeInNewTree && oldNode.parent.id !== oldNodeInNewTree.parent.id
}

const newNodeHasMoved = (newNode, oldNodeMap) => {
  const newNodeInOldTree = oldNodeMap[newNode.id]
  return newNodeInOldTree && newNode.parent.id !== newNodeInOldTree.parent.id
}

const elementMove = (node: any, parentId: number, index: number, nodeMap: any) => {
  console.assert(typeof parentId === 'number')
  const beforeElement = nodeMap[parentId].children[index - 1]
  const beforeElementId = (beforeElement && beforeElement.id) || 0
  return {
    command: 'elementMove',
    payload: {
      id: node.id,
      parentId,
      beforeId: beforeElementId,
    },
  }
}

function elementInsert(
  node: {
    nodeType: string
    id: any
    tag: any
    attributes: any
    children: { flatMap: (arg0: (child: any, index: any) => any[]) => void }
    text: any
  },
  parentId: number,
  index: number,
  nodeMap
) {
  const beforeElement = nodeMap[parentId].children[index - 1]
  const beforeElementId = (beforeElement && beforeElement.id) || 0
  if (node.nodeType === NodeType.ElementNode) {
    return [
      {
        command: 'elementInsert',
        payload: {
          id: node.id,
          nodeType: node.nodeType,
          tag: node.tag,
          parentId,
          beforeId: beforeElementId,
          attributes: node.attributes,
        },
      },
      // @ts-ignore
      ...node.children.flatMap((child: any, index: any) =>
        elementInsert(child, node.id, index, nodeMap)
      ),
    ]
  }

  if (node.nodeType === 'TextNode' || node.nodeType === 'CommentNode') {
    return [
      {
        command: 'elementInsert',
        payload: {
          nodeType: node.nodeType,
          id: node.id,
          text: node.text,
          parentId,
          index,
          beforeId: beforeElementId,
        },
      },
    ]
  }

  console.log(node)

  throw new Error('invalid node')
}

function textReplace(node: { id: any; text: any }) {
  return {
    command: 'textReplace',
    payload: {
      id: node.id,
      text: node.text,
    },
  }
}

/**
 * Generate a list of edits that will mutate oldNodes to look like newNodes.
 *
 */
export function diff(
  oldNodes: any[],
  newNodes: any[],
  {
    parentId = 0,
    oldNodeMap = {},
    newNodeMap = {},
    oldParserState = 'valid',
    newParserState = 'valid',
  }: {
    parentId?: number
    oldNodeMap?: any
    newNodeMap?: any
    oldParserState?: any
    newParserState?: any
  } = {}
): any[] {
  if (oldParserState === 'invalid') {
    throw new Error('old parser state must be valid or soft-invalid')
  }

  if (newParserState === 'invalid') {
    return []
  }

  let oldIndex: number = 0
  let newIndex: number = 0
  let edits: any[] = []

  /**
   * Take care of common nodes
   */
  while (newIndex < newNodes.length && oldIndex < oldNodes.length) {
    const newNode = newNodes[newIndex]
    const oldNode = oldNodes[oldIndex]

    if (newNodeHasMoved(newNode, oldNodeMap)) {
      edits = [...edits, elementMove(newNode, parentId, newIndex, newNodeMap)]
      newIndex++
      continue
    }
    if (oldNodeHasMoved(oldNode, newNodeMap)) {
      oldIndex++
      continue
    }

    oldNode.nodeType // ?
    newNode.nodeType // ?
    oldNode.subtreeSignature // ?
    newNode.subtreeSignature // ?

    if (newNode.nodeType === NodeType.ElementNode && oldNode.nodeType === NodeType.ElementNode) {
      if (newNode.id === oldNode.id) {
        if (oldNode.tag === newNode.tag) {
          if (newNode.attributeSignature !== oldNode.attributeSignature) {
            edits = [...edits, ...attributeEdits(oldNode, newNode)]
          }

          if (newNode.subtreeSignature !== oldNode.subtreeSignature) {
            edits = [
              ...edits,
              ...diff(oldNode.children, newNode.children, {
                parentId: newNode.id,
                oldNodeMap,
                newNodeMap,
              }),
            ]
          }
        } else {
          edits = [
            elementDelete(oldNode),
            ...edits,
            ...elementInsert(newNode, parentId, newIndex, newNodeMap),
          ]
        }

        oldIndex++
        newIndex++
        continue
      } else if (!newNodeMap[oldNode.id]) {
        oldNode
        edits = [elementDelete(oldNode), ...edits]
        oldIndex++
        continue
      } else if (!oldNodeMap[newNode.id]) {
        edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
        newIndex++
        continue
      } else {
        newNodeMap
        newNode
        oldNode
        // Edits = [...edits, ...elementInsert(newNode, parentId, newIndex)];
        // newIndex++;
        // OldNodeMap;
        // newNodeMap;
        // oldNode;
        // newNode;
        throw new Error('cannot determine diff')
      }
    }

    if (newNode.nodeType === NodeType.ElementNode && oldNode.nodeType !== NodeType.ElementNode) {
      if (!newNodeMap[oldNode.id]) {
        edits = [elementDelete(oldNode), ...edits]
        oldIndex++
        continue
      } else if (!oldNodeMap[newNode.id]) {
        edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
        newIndex++
      } else {
        edits = [
          elementDelete(oldNode),
          ...edits,
          ...elementInsert(newNode, parentId, newIndex, newNodeMap),
        ]
        oldIndex++
        newIndex++
        continue
        // Throw new Error('cannot determine diff');
      }

      // If()
      // oldNode;
      // newNode;
      // edits = [
      // 	...edits,
      // 	elementDelete(oldNode),
      // 	...elementInsert(newNode, parentId, newIndex - 1)
      // ];
      // oldIndex++;
      // newIndex++;
      continue
    }

    if (newNode.nodeType !== NodeType.ElementNode && oldNode.nodeType === NodeType.ElementNode) {
      if (newNodeMap[oldNode.id]) {
        edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
        newIndex++
        continue
      } else {
        edits = [elementDelete(oldNode), ...edits]
        oldIndex++
        continue
      }
    }

    if (newNode.nodeType !== oldNode.nodeType) {
      if (oldNode.id === newNode.id) {
        edits = [...edits, textReplace(newNode)]
        oldIndex++
        newIndex++
        continue
      } else if (!newNodeMap[oldNode.id]) {
        edits = [elementDelete(oldNode), ...edits]
        oldIndex++
        continue
      } else if (!oldNodeMap[newNode.id]) {
        edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
        newIndex++
        continue
      } else {
        edits = [
          elementDelete(oldNode),
          ...edits,
          ...elementInsert(newNode, parentId, newIndex, newNodeMap),
        ]
        oldIndex++
        newIndex++
        continue
        // Throw new Error('cannot determine diff');
      }
    }

    if (
      ((newNode.nodeType === 'TextNode' && oldNode.nodeType === 'TextNode') ||
        (newNode.nodeType === 'CommentNode' && oldNode.nodeType === 'CommentNode')) &&
      (oldNode.id !== newNode.id || newNode.textSignature !== oldNode.textSignature)
    ) {
      if (oldNode.id === newNode.id) {
        edits = [...edits, textReplace(newNode)]
        oldIndex++
        newIndex++
        continue
      } else if (!newNodeMap[oldNode.id]) {
        edits = [elementDelete(oldNode), ...edits]
        oldIndex++
        continue
      } else if (!oldNodeMap[newNode.id]) {
        edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
        newIndex++
        continue
      } else {
        edits = [
          elementDelete(oldNode),
          ...edits,
          ...elementInsert(newNode, parentId, newIndex, newNodeMap),
        ]
        oldIndex++
        newIndex++
        continue
        // Throw new Error('cannot determine diff');
      }
    }

    // TODO what to do here???
    // edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
    oldNode
    newNode
    oldIndex++
    newIndex++
    // Continue;
  }

  /**
   * Take care of any remaining nodes in the old tree.
   */
  while (oldIndex < oldNodes.length) {
    const oldNode = oldNodes[oldIndex]

    if (oldNodeHasMoved(oldNode, newNodeMap)) {
      oldIndex++
      continue
    }
    oldIndex++
    edits = [elementDelete(oldNode), ...edits]
  }

  /**
   * Take care of the remaining nodes in the new tree.
   */
  while (newIndex < newNodes.length) {
    const newNode = newNodes[newIndex]
    if (newNodeHasMoved(newNode, oldNodeMap)) {
      edits = [...edits, elementMove(newNode, parentId, newIndex, newNodeMap)]
      newIndex++
      continue
    }
    newIndex++
    edits = [...edits, ...elementInsert(newNode, parentId, newIndex, newNodeMap)]
  }

  return edits
}

const pretty = (node: {
  nodeType: string
  tag: any
  children: {
    map: (
      arg0: (node: any) =>
        | {
            tag: any
            children: any
            id: any
            attributes: any
            type?: undefined
            text?: undefined
          }
        | {
            type: any
            text: any
            id: any
            tag?: undefined
            children?: undefined
            attributes?: undefined
          }
    ) => void
  }
  id: any
  attributes: any
  text: any
}) => {
  if (node.nodeType === NodeType.ElementNode) {
    return {
      tag: node.tag,
      children: node.children.map(pretty),
      id: node.id,
      attributes: node.attributes,
    }
  }

  return {
    type: node.nodeType,
    text: node.text,
    id: node.id,
  }
}

// @ts-ignore
Array.prototype.pretty = function () {
  return JSON.stringify(
    this.map(pretty),
    (k, v) => {
      return v === undefined ? null : v
    },
    2
  )
}

// const testCase = {
//   previousDom: `<p>a</p><p>b<br></p>`,
//   nextDom: `<p>ab<br></p>`,
// }
// const parser = createParser()
// const { htmlDocument: parsedH1 } = parser.parse(testCase.previousDom)
// const oldNodeMap = parser.nodeMap // ?
// const { htmlDocument: parsedH2 } = parser.edit(testCase.nextDom, [
//   {
//     rangeOffset: 4,
//     rangeLength: 7,
//     text: '',
//   },
// ])
// const newNodeMap = parser.nodeMap // ?
// // parsedH1.pretty(); // ?
// // parsedH2.pretty(); // ?
// diff(parsedH1!.children, parsedH2!.children, {
//   oldNodeMap,
//   newNodeMap,
// }) // ?
const testCase = {
  previousDom: `<section>
</section>
<h1>hello world</h1>
`,
  nextDom: `<section>
  <h1>hello world</h1>
</section>
`,
}
const parser = createParser()
const { htmlDocument: parsedH1 } = parser.parse(testCase.previousDom)
const oldNodeMap = parser.nodeMap // ?
const { htmlDocument: parsedH2 } = parser.edit(testCase.nextDom, [
  {
    rangeOffset: 41,
    rangeLength: 0,
    text: '\n</section>',
  },
  {
    rangeOffset: 21,
    rangeLength: 0,
    text: '  ',
  },
  {
    rangeOffset: 10,
    rangeLength: 11,
    text: '',
  },
])
const newNodeMap = parser.nodeMap // ?
// parsedH1.pretty(); // ?
// parsedH2.pretty(); // ?
diff(parsedH1!.children, parsedH2!.children, {
  oldNodeMap,
  newNodeMap,
}) // ?
// const testCase = {
//   previousDom: `a<h1>b</h1>`,
//   nextDom: `<h1>b</h1>`,
// }
// const parser = createParser()
// const { htmlDocument: parsedH1 } = parser.parse(testCase.previousDom)
// const oldNodeMap = parser.nodeMap // ?
// const { htmlDocument: parsedH2 } = parser.edit(testCase.nextDom, [
//   {
//     rangeOffset: 0,
//     rangeLength: 1,
//     text: '',
//   },
// ])
// const newNodeMap = parser.nodeMap // ?
// // parsedH1.pretty(); // ?
// // parsedH2.pretty(); // ?
// diff(parsedH1!.children, parsedH2!.children, {
//   oldNodeMap,
//   newNodeMap,
// }) // ?
