import * as NodeType from '../NodeType/NodeType'
import { parse } from '../Parse/Parse'
import type { Node, NodeMap } from '../ParseResult/ParseResult'
import { updateOffsetMap } from '../UpdateOffsetMap/UpdateOffsetMap'
import type { SuccessResult } from '../virtualDomMain'
import { diff, State } from './Diff'

const expectDiff = (oldState: State, newState: State) => ({
  toEqual: expectedDiff => {
    expect(diff(oldState, newState)).toEqual(expectedDiff)
  },
})

type Mutable<T> = { -readonly [P in keyof T]: T[P] }

const createNodeMapInternal = (nodeMap: Mutable<NodeMap>, nodes: readonly Node[]) => {
  for (const node of nodes) {
    switch (node.nodeType) {
      case 'CommentNode':
      case 'TextNode':
      case 'Doctype':
        nodeMap[node.id] = node
        break
      case 'ElementNode':
        nodeMap[node.id] = node
        createNodeMapInternal(nodeMap, node.children)
      default:
        break
    }
  }
}

const createNodeMap = (nodes: readonly Node[]): NodeMap => {
  const nodeMap: Mutable<NodeMap> = Object.create(null)
  createNodeMapInternal(nodeMap, nodes)
  return nodeMap
}

test('delete element node at start', () => {
  const oldNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h1',
      id: 0,
      attributes: {},
      children: [],
    },
    {
      nodeType: NodeType.ElementNode,
      tag: 'h2',
      id: 1,
      attributes: {},
      children: [],
    },
  ]
  const newNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h2',
      id: 1,
      attributes: {},
      children: [],
    },
  ]

  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)
  expectDiff(
    {
      nodes: oldNodes,
      nodeMap: oldNodeMap,
    },
    {
      nodes: newNodes,
      nodeMap: newNodeMap,
    }
  ).toEqual([{ command: 'elementDelete', payload: { id: 0 } }])
})

test('delete element node at end', () => {
  const oldNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h1',
      id: 0,
      attributes: {},
      children: [],
    },
    {
      nodeType: NodeType.ElementNode,
      tag: 'h2',
      id: 1,
      attributes: {},
      children: [],
    },
  ]
  const newNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h1',
      id: 0,
      attributes: {},
      children: [],
    },
  ]

  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)
  expectDiff(
    {
      nodes: oldNodes,
      nodeMap: oldNodeMap,
    },
    {
      nodes: newNodes,
      nodeMap: newNodeMap,
    }
  ).toEqual([{ command: 'elementDelete', payload: { id: 1 } }])
})

test('attribute changes', () => {
  const oldNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      children: [],
      id: 0,
      tag: 'h1',
      attributes: {
        a: '1',
        class: 'big',
      },
    },
  ]
  const newNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      children: [],
      id: 0,
      tag: 'h1',
      attributes: {
        x: '2',
        a: '2',
      },
    },
  ]

  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)

  expectDiff(
    { nodes: oldNodes, nodeMap: oldNodeMap },
    { nodes: newNodes, nodeMap: newNodeMap }
  ).toEqual([
    {
      command: 'attributeChange',
      payload: {
        attributeName: 'a',
        attributeValue: '2',
        id: 0,
      },
    },
    { command: 'attributeDelete', payload: { attributeName: 'class', id: 0 } },
    { command: 'attributeAdd', payload: { attributeName: 'x', attributeValue: '2', id: 0 } },
  ])
})

test('text change', () => {
  const oldNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h1',
      attributes: {},
      id: 0,
      children: [
        {
          id: 1,
          nodeType: NodeType.TextNode,
          text: 'hello world',
        },
      ],
    },
  ]
  const newNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'h1',
      attributes: {},
      id: 0,
      children: [
        {
          id: 1,
          nodeType: NodeType.TextNode,
          text: 'hello world!',
        },
      ],
    },
  ]

  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)
  expectDiff(
    { nodes: oldNodes, nodeMap: oldNodeMap },
    { nodes: newNodes, nodeMap: newNodeMap }
  ).toEqual([{ command: 'textReplace', payload: { id: 1, text: 'hello world!' } }])
})

test('add two tags at once', () => {
  const oldNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'body',
      attributes: {},
      id: 0,
      children: [
        {
          nodeType: NodeType.ElementNode,
          tag: 'main',
          attributes: {},
          children: [],
          id: 1,
        },
      ],
    },
  ]
  const newNodes: readonly Node[] = [
    {
      nodeType: NodeType.ElementNode,
      tag: 'body',
      attributes: {},
      id: 0,
      children: [
        {
          nodeType: NodeType.ElementNode,
          tag: 'main',
          attributes: {},
          id: 1,
          children: [
            {
              nodeType: NodeType.ElementNode,
              tag: 'div',
              attributes: {},
              id: 2,
              children: [
                {
                  nodeType: NodeType.TextNode,
                  text: 'New Content',
                  id: 3,
                },
              ],
            },
            {
              nodeType: NodeType.ElementNode,
              tag: 'div',
              attributes: {},
              children: [
                {
                  nodeType: NodeType.TextNode,
                  id: 5,
                  text: 'More new Content',
                },
              ],
              id: 4,
            },
          ],
        },
      ],
    },
  ]

  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)
  expectDiff(
    { nodes: oldNodes, nodeMap: oldNodeMap },
    { nodes: newNodes, nodeMap: newNodeMap }
  ).toEqual([
    {
      command: 'elementInsert',
      payload: {
        id: 2,
        parentId: 1,
        index: 0,
        nodeType: NodeType.ElementNode,
        tag: 'div',
        attributes: {},
      },
    },
    {
      command: 'elementInsert',
      payload: { id: 3, parentId: 2, index: 0, nodeType: NodeType.TextNode, text: 'New Content' },
    },
    {
      command: 'elementInsert',
      payload: {
        id: 4,
        parentId: 1,
        index: 1,
        nodeType: NodeType.ElementNode,
        tag: 'div',
        attributes: {},
      },
    },
    {
      command: 'elementInsert',
      payload: {
        id: 5,
        parentId: 4,
        index: 0,
        nodeType: NodeType.TextNode,
        text: 'More new Content',
      },
    },
  ])
})

test('delete across tags', () => {
  const oldNodes: readonly Node[] = [
    {
      tag: 'p',
      nodeType: NodeType.ElementNode,
      id: 0,
      attributes: {},
      children: [
        {
          nodeType: NodeType.TextNode,
          text: '\n  Hello\n',
          id: 1,
        },
      ],
    },
    {
      text: '\n',
      nodeType: NodeType.TextNode,
      id: 2,
    },
    {
      nodeType: NodeType.ElementNode,
      attributes: {},
      id: 3,
      tag: 'p',
      children: [
        {
          nodeType: NodeType.TextNode,
          text: '\n  ',
          id: 4,
        },
        {
          nodeType: NodeType.ElementNode,
          tag: 'em',
          id: 5,
          attributes: {},
          children: [
            {
              nodeType: NodeType.TextNode,
              text: 'World',
              id: 6,
            },
          ],
        },
        {
          nodeType: NodeType.TextNode,
          text: '\n\n',
          id: 7,
        },
      ],
    },
  ]

  const newNodes: readonly Node[] = [
    {
      tag: 'p',
      nodeType: NodeType.ElementNode,
      id: 0,
      attributes: {},
      children: [
        {
          nodeType: NodeType.TextNode,
          text: '\n  Hello\n\n    ',
          id: 1,
        },
        {
          nodeType: NodeType.ElementNode,
          tag: 'em',
          id: 5,
          attributes: {},
          children: [
            {
              nodeType: NodeType.TextNode,
              text: 'World',
              id: 6,
            },
          ],
        },
        {
          nodeType: NodeType.TextNode,
          text: '\n\n',
          id: 7,
        },
      ],
    },
  ]
  const oldNodeMap: NodeMap = createNodeMap(oldNodes)
  const newNodeMap: NodeMap = createNodeMap(newNodes)
  expectDiff(
    { nodes: oldNodes, nodeMap: oldNodeMap },
    { nodes: newNodes, nodeMap: newNodeMap }
  ).toEqual([
    { command: 'elementDelete', payload: { id: 3 } },
    { command: 'elementDelete', payload: { id: 2 } },
    { command: 'elementMove', payload: { id: 7, index: 2, parentId: 0 } },
    { command: 'elementMove', payload: { id: 5, index: 1, parentId: 0 } },
    { command: 'textReplace', payload: { id: 1, text: '\n  Hello\n\n    ' } },
  ])
})

test('expand without body', () => {
  let offsetMap = Object.create(null)

  let id = 0
  const p1 = parse(
    `<h1 class>hello world</h1>
p`,
    offset => {
      const nextId = id++
      offsetMap[offset] = nextId
      return nextId
    }
  )

  offsetMap = updateOffsetMap(offsetMap, [
    {
      rangeOffset: 27,
      rangeLength: 1,
      text: '<p></p>',
    },
  ])
  let newOffsetMap = Object.create(null)
  const p2 = parse(
    `<h1 class>hello world</h1>
<p></p>`,
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
  expect(p1.status).toBe('success')
  expect(p2.status).toBe('success')
  expect(diff(p1 as SuccessResult, p2 as SuccessResult)).toEqual([
    { command: 'textReplace', payload: { id: 2, text: '\n' } },
    {
      command: 'elementInsert',
      payload: {
        nodeType: NodeType.ElementNode,
        tag: 'p',
        id: 3,
        attributes: {},
        index: 2,
        parentId: 'body',
      },
    },
  ])
})
