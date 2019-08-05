export type Node = ElementNode & CommentNode & TextNode;

export type ElementNode = {
	type: 'ElementNode'
	attributes: {[key: string]: string | undefined}
	children: Node[]
	tag: string
};

export type CommentNode = {
	type: 'CommentNode'
	text: string
};

export type TextNode = {
	type: 'TextNode'
	text: string
};
