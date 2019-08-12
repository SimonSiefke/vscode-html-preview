import {RemotePlugin, mergePlugins} from '../remotePluginApi';

function fixAttributeValue(value: string | null) {
	console.log(value);
	if (value === null) {
		return '';
	}

	if (
		(value && (value.startsWith('\'') && value.endsWith('\''))) ||
		(value.startsWith('"') && value.endsWith('"'))
	) {
		return value.slice(1, -1);
	}

	return value;
}

const textReplace: RemotePlugin = api => {
	api.webSocket.onMessage('textReplace', payload => {
		const $node = api.nodeMap[payload.id] as Comment;
		if ($node === undefined) {
			debugger;
		}

		$node.data = payload.text;
	});
};

const attributeChange: RemotePlugin = api => {
	api.webSocket.onMessage('attributeChange', payload => {
		const $node = api.nodeMap[payload.id] as HTMLElement;
		$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
	});
};

const attributeAdd: RemotePlugin = api => {
	api.webSocket.onMessage('attributeAdd', payload => {
		const $node = api.nodeMap[payload.id] as HTMLElement;
		$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
	});
};

const attributeDelete: RemotePlugin = api => {
	api.webSocket.onMessage('attributeDelete', payload => {
		const $node = api.nodeMap[payload.id] as HTMLElement;
		$node.removeAttribute(payload.attribute);
	});
};

const elementDelete: RemotePlugin = api => {
	api.webSocket.onMessage('elementDelete', payload => {
		const $node = api.nodeMap[payload.id];
		if (!$node) {
			debugger;
		}

		if ($node.remove) {
			$node.remove();
		} else if ($node.parentNode && $node.parentNode.removeChild) {
			$node.parentNode.removeChild($node);
		}

		delete api.nodeMap[payload.id];
	});
};

const elementInsert: RemotePlugin = api => {
	api.webSocket.onMessage('elementInsert', payload => {
		let $node: HTMLElement | Text | Comment;
		if (payload.nodeType === 'ElementNode') {
			$node = document.createElement(payload.tag) as HTMLElement;
			for (const attributeName of Object.keys(payload.attributes)) {
				$node.setAttribute(attributeName, fixAttributeValue(payload.attributes[attributeName]));
				console.log(payload.id);
			}

			$node.setAttribute('data-id', `${payload.id}`);
		} else if (payload.nodeType === 'TextNode') {
			$node = document.createTextNode(payload.text);
		} else if (payload.nodeType === 'CommentNode') {
			$node = document.createComment(payload.text);
		} else {
			// @debug
			throw new Error('invalid node type');
		}

		api.nodeMap[payload.id] = $node;
		const $parent = api.nodeMap[payload.parentId] as HTMLElement;
		if (!$parent) {
			debugger;
		}

		if (payload.beforeId === 0) {
			$parent.prepend($node);
		} else {
			const $referenceNode = api.nodeMap[payload.beforeId];
			// @debug
			if (!$referenceNode) {
				console.log(payload.beforeId);
				console.log(api.nodeMap);
				console.error(
					`failed to insert new element because reference node with id ${payload.beforeId} does not exist`
				);
				return;
			}

			$parent.insertBefore($node, $referenceNode.nextSibling);
		}
	});
};

export const core = mergePlugins(
	textReplace,
	attributeChange,
	elementDelete,
	elementInsert,
	attributeAdd,
	attributeDelete
);
