type GenericWebsocketMessage<Command> = Command & {id: number; type: 'request' | 'response'};

/**
 * Commands that can be executed by the browser
 */
interface RemoteCommandMap {
	attributeAdd: {
		attribute: string
		id: number
		value: string
	}
	attributeChange: {
		attribute: string
		id: number
		value: string
	}
	attributeDelete: {
		attribute: string
		id: number
	}
	elementDelete: {
		id: number
	}
	elementInsert: {
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

	error: {
		message: string
	}
	highlight: {
		id: number
	}
	redirect: {
		url: string
	}
	success: {}
	textReplace: {
		id: number
		text: string
	}
}

type GenericRemoteCommand<K extends keyof RemoteCommandMap> = {
	command: K
	payload: RemoteCommandMap[K]
};

/**
 * A Command that can be executed by the browser
 */
type RemoteCommand =
	| GenericRemoteCommand<'attributeAdd'>
	| GenericRemoteCommand<'attributeChange'>
	| GenericRemoteCommand<'attributeDelete'>
	| GenericRemoteCommand<'elementDelete'>
	| GenericRemoteCommand<'elementInsert'>
	| GenericRemoteCommand<'error'>
	| GenericRemoteCommand<'highlight'>
	| GenericRemoteCommand<'redirect'>
	| GenericRemoteCommand<'success'>
	| GenericRemoteCommand<'textReplace'>;
type RemoteCommandWebsocketMessage = GenericWebsocketMessage<RemoteCommand>;

/**
 * Commands that can be executed by the VSCode extension
 */
interface LocalCommandMap {
	highlight: {
		id: number
	}
	success: {}
}

type GenericLocalCommand<K extends keyof LocalCommandMap> = {
	command: K
	payload: LocalCommandMap[K]
};

/**
 * A Command that can be executed by the VSCode extension
 */
type LocalCommand = GenericLocalCommand<'highlight'> | GenericLocalCommand<'success'>;
type LocalCommandWebsocketMessage = GenericWebsocketMessage<LocalCommand>;
