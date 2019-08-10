import {nodeMap, useCommand} from '../remotePluginApi';

function fixAttributeValue(value: string | null) {
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

export const textReplace: RemotePluginCore['textReplace'] = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as Comment;
		if ($node === undefined) {
			debugger;
		}

		$node.data = payload.text;
	};
});

export const attributeChange: RemotePluginCore['attributeChange'] = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as HTMLElement;
		$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
	};
});

export const attributeAdd: RemotePluginCore['attributeAdd'] = useCommand(() => {
	return payload => {
		// just forward the request because it does the same thing
		attributeChange(payload);
	};
});

export const attributeDelete: RemotePluginCore['attributeDelete'] = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as HTMLElement;
		$node.removeAttribute(payload.attribute);
	};
});

export const elementDelete: RemotePluginCore['elementDelete'] = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id];
		if (!$node) {
			debugger;
		}

		if ($node.remove) {
			$node.remove();
		} else if ($node.parentNode && $node.parentNode.removeChild) {
			$node.parentNode.removeChild($node);
		}

		delete nodeMap[payload.id];
	};
});

export const elementInsert: RemotePluginCore['elementInsert'] = useCommand(() => {
	return payload => {
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

		nodeMap[payload.id] = $node;
		const $parent = nodeMap[payload.parentId] as HTMLElement;
		if (!$parent) {
			debugger;
		}

		if (payload.beforeId === 0) {
			$parent.prepend($node);
		} else {
			const $referenceNode = nodeMap[payload.beforeId];
			// @debug
			if (!$referenceNode) {
				console.log(payload.beforeId);
				console.log(nodeMap);
				console.error(
					`failed to insert new element because reference node with id ${payload.beforeId} does not exist`
				);
				return;
			}

			$parent.insertBefore($node, $referenceNode.nextSibling);
		}
	};
});
