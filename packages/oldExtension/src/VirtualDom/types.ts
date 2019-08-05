export type Node = ElementNode & CommentNode & TextNode;

export type ElementNode = {
	type: 'ElementNode'
	attributes: {[key: string]: string | undefined}
	children: Node[]
	tag: string
	parent: Node | undefined
};

export type CommentNode = {
	type: 'CommentNode'
	text: string
	parent: Node | undefined
};

export type TextNode = {
	type: 'TextNode'
	text: string
	parent: Node | undefined
};

export type TextNodeWithSignature  ={
	type:"TextNode"
	text:string
	parent:Node|undefined
	textSignature:string
}

export type ScannerState =
	| 'within-content'
	| 'after-opening-start-tag'
	| 'after-opening-end-tag'
	| 'within-start-tag'
	| 'within-end-tag'
	| 'within-comment'
	| 'after-attribute-name'
	| 'before-attribute-value';

export type TokenType =
	| 'start-comment-tag'
	| 'comment'
	| 'end-comment-tag'
	| 'start-tag-open'
	| 'start-tag-close'
	| 'start-tag-self-close'
	| 'start-tag'
	| 'end-tag-open'
	| 'end-tag-close'
	| 'end-tag'
	| 'attribute-name'
	| 'attribute-value'
	| 'content'
	| 'eos'
	| 'delimiter-assign'
	| 'unknown';
