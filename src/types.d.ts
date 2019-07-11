declare type Position = {line: number; ch: number};

declare type Token = {
	type: string
	contents: string
	start: number
	end: number
	startPos: Position | undefined
	endPos: Position | undefined
};
