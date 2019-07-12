export type Position = {line: number; ch: number};

export type Token = {
	type: string
	contents: string
	start: number
	end: number
	startPos: Position | undefined
	endPos: Position | undefined

};
