import {Position} from '../types';

export interface SimpleNode {
	children: SimpleNode[]
	childSignature?: string
	subtreeSignature?: string
	textSignature?: string
	content?: string
	attributes?: {
		[key: string]: string
	}
	attributeSignature?: string
	parent: SimpleNode | undefined
	startPos?: Position | undefined
	tagId: number | string
	tag?: string
	start?: number | undefined
	end?: number
	endPos?: Position
}
