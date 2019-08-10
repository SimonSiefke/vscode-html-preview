type LocalPluginCore = {};
type RemotePluginCore = {
	attributeAdd: (payload: {attribute: string; id: number; value: string}) => void
	attributeChange: (payload: {attribute: string; id: number; value: string}) => void
	attributeDelete: (payload: {attribute: string; id: number}) => void
	elementDelete: (payload: {id: number}) => void
	elementInsert: (
		payload: {
		id: number
		nodeType: 'ElementNode'
		tag: string
		attributes: {
		[key: string]: string
		}
		parentId: number
		beforeId: number
		} & {id: number; nodeType: 'TextNode'; text: string; parentId: number; beforeId: number} & {
		id: number
		nodeType: 'CommentNode'
		parentId: number
		beforeId: number
		}
	) => void
	textReplace: (payload: {id: number; text: string}) => void
};

type LocalPluginError = {};
type RemotePluginError = {
	error: (payload: {message: string}) => void
};

type LocalPluginHighlight = {};
type RemotePluginHighlight = {
	highlight: (payload: {id: number}) => void
};
