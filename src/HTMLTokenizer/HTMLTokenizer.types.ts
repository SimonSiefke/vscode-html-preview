import {Position, Token} from '../types';

export interface Context {
	state: number
	buffer: string
	sectionStart: number
	sectionStartPos: Position | undefined
	index: number
	indexPos: Position | undefined
	special: number // 1 for script, 2 for style
	token: Token | undefined
	nextToken: Token | undefined
}
