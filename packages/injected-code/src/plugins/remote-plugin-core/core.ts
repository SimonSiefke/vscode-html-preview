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
		// cannot delete those
		// @ts-ignore
		if ($node.tagName && ['HTML', 'HEAD', 'BODY'].includes($node.tagName)) {
			delete api.nodeMap[payload.id];
			return;
		}

		if (!$node) {
			debugger;
		}

		// @ts-ignore
		if ($node.remove) {
			// @ts-ignore
			$node.remove();
		} else if ($node.parentNode && $node.parentNode.removeChild) {
			$node.parentNode.removeChild($node);
		}

		delete api.nodeMap[payload.id];
	});
};

const elementInsert: RemotePlugin = api => {
	api.webSocket.onMessage('elementInsert', payload => {
		let $node: HTMLElement | Text | Comment | DocumentType;
		if (payload.nodeType === 'ElementNode') {
			const tag = payload.tag.toLowerCase();
			if (tag === 'html') {
				api.nodeMap[payload.id] = document.documentElement;
				return;
			}

			if (tag === 'body') {
				api.nodeMap[payload.id] = document.body;
				return;
			}

			if (tag === 'head') {
				api.nodeMap[payload.id] = document.head;
				return;
			}

			if (tag === '!doctype') {
				$node = document.implementation.createDocumentType('html', '', '');
			} else {
				$node = document.createElement(payload.tag) as HTMLElement;
				for (const [attributeName, attributeValue] of Object.entries<any>(payload.attributes)) {
					$node.setAttribute(attributeName, fixAttributeValue(attributeValue));
				}

				$node.setAttribute('data-id', `${payload.id}`);
			}
		} else if (payload.nodeType === 'TextNode') {
			$node = document.createTextNode(payload.text);
		} else if (payload.nodeType === 'CommentNode') {
			$node = document.createComment(payload.text);
		} else {
			// @debug
			throw new Error('invalid node type');
		}

		api.nodeMap[payload.id] = $node;
		let $parent = api.nodeMap[payload.parentId] as HTMLElement;
		if (!$parent) {
			debugger;
		}

		if (
			payload.parentId === 0 &&
			!(payload.nodeType === 'CommentNode' || ['html', 'head', 'body'].includes(payload.tag))
		) {
			$parent = document.body;
			for (const rootNode of api.virtualDom) {
				const rootNodeParent = api.nodeMap[rootNode.id] && api.nodeMap[rootNode.id].parentNode;
				if (rootNodeParent === document) {
					payload.beforeId--;
				} else {
					break;
				}
			}
		}

		console.log($parent);
		if (payload.beforeId === 0) {
			console.log('prepend');
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
