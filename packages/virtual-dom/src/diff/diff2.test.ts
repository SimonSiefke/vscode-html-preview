import { diff, ElementNode, State } from './diff2'

const expectDiff = (oldState: State, newState: State) => ({
  toEqual: expectedDiff => {
    expect(diff(oldState, newState)).toEqual(expectedDiff)
  },
})

test('delete element node at start', () => {
  const node0: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h1',
    id: 0,
    attributes: {},
    children: [],
  }
  const node1: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h2',
    id: 1,
    attributes: {},
    children: [],
  }
  const oldNodeMap = {
    0: node0,
    1: node1,
  }
  const newNodeMap = {
    1: node1,
  }
  expectDiff(
    {
      nodes: [node0, node1],
      nodeMap: oldNodeMap,
    },
    {
      nodes: [node1],
      nodeMap: newNodeMap,
    }
  ).toEqual([{ command: 'elementDelete', payload: { id: 0 } }])
})

test('delete element node at end', () => {
  const node0: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h1',
    id: 0,
    attributes: {},
    children: [],
  }
  const node1: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h2',
    id: 1,
    attributes: {},
    children: [],
  }
  const oldNodeMap = {
    0: node0,
    1: node1,
  }
  const newNodeMap = {
    0: node0,
  }
  expectDiff(
    {
      nodes: [node0, node1],
      nodeMap: oldNodeMap,
    },
    {
      nodes: [node0],
      nodeMap: newNodeMap,
    }
  ).toEqual([{ command: 'elementDelete', payload: { id: 1 } }])
})

test('attribute changes', () => {
  const node0: ElementNode = {
    nodeType: 'ElementNode',
    children: [],
    id: 0,
    tag: 'h1',
    attributes: {
      a: '1',
      class: 'big',
    },
  }

  const node1: ElementNode = {
    nodeType: 'ElementNode',
    children: [],
    id: 0,
    tag: 'h1',
    attributes: {
      x: '2',
      a: '2',
    },
  }

  const oldNodeMap = {
    0: node0,
  }
  const newNodeMap = {
    1: node1,
  }

  expectDiff(
    { nodes: [node0], nodeMap: oldNodeMap },
    { nodes: [node1], nodeMap: newNodeMap }
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
  const node0: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h1',
    attributes: {},
    id: 0,
    children: [
      {
        id: 1,
        nodeType: 'TextNode',
        text: 'hello world',
      },
    ],
  }
  const node1: ElementNode = {
    nodeType: 'ElementNode',
    tag: 'h1',
    attributes: {},
    id: 0,
    children: [
      {
        id: 1,
        nodeType: 'TextNode',
        text: 'hello world!',
      },
    ],
  }
  const oldNodeMap = {
    0: node0,
  }
  const newNodeMap = {
    0: node1,
  }
  expectDiff(
    { nodes: [node0], nodeMap: oldNodeMap },
    { nodes: [node1], nodeMap: newNodeMap }
  ).toEqual([{ command: 'textReplace', payload: { id: 1, text: 'hello world!' } }])
})
