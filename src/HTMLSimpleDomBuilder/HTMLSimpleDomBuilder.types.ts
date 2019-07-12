import {Position} from '../types';
import {SimpleNode} from './HTMLSimpleDomBuilder';

export interface Context {
	stack?: any[]
	text?: string
	currentTag?: SimpleNode
	startOffset: number
	startOffsetPos: Position
	errors?: any[]
}

export interface Error {
	startPos?: Position | undefined
	endPos?: Position | undefined
	token: any
}

export type NoUndefined<T> = T extends undefined ? never : true;
