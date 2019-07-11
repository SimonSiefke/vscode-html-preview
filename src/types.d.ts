declare type Position = {line: number; ch: number};

declare type Token = {
	type: string
	contents: string
	start: number
	end: number
	startPos: Position | undefined
	endPos: Position | undefined
};

declare type Context = {
	state: number
	buffer: string
	sectionStart: number
	sectionStartPos: Position | undefined
	index: number
	indexPos: Position | undefined
	special: number // 1 for script, 2 for style
	token: Token | undefined
	nextToken: Token | undefined
};
