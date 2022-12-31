export interface ElementNode {
  attributes: {
    [key: string]: string
  }
  children: (ElementNode | CommentNode | TextNode)[]
  readonly tag: string
  readonly id: string | number
  readonly nodeType: 'ElementNode'
}

export interface CommentNode {
  readonly nodeType: 'CommentNode'
  readonly text: string
  readonly id: number
}

export interface TextNode {
  readonly nodeType: 'TextNode'
  readonly text: string
  readonly id: number
}

export interface DoctypeNode {
  readonly nodeType: 'Doctype'
  readonly tag: '!DOCTYPE'
  readonly id: number
}

export type Node = DoctypeNode | ElementNode | CommentNode | TextNode

export interface NodeMap {
  readonly [id: number]: Node
}

export type SuccessResult = {
  readonly status: 'success'
  readonly nodes: readonly Node[]
  readonly nodeMap: NodeMap
}

export type ErrorResult = {
  readonly status: 'invalid'
  readonly index: number
  readonly reason?: string
}
