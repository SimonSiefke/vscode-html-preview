import {addHighlight} from './plugins/highlight/highlight';

function walk(dom, fn, childrenFirst = false) {
	if (Array.isArray(dom)) {
		return dom.map(d => walk(d, fn, childrenFirst));
	}

	if (!childrenFirst) {
		fn(dom);
	}

	if (dom.children) {
		walk(dom.children, fn, childrenFirst);
	}

	if (childrenFirst) {
		fn(dom);
	}

	return dom;
}

const nodeMap: {[key: number]: HTMLElement | Text | Comment} = (() => {
	const _nodeMap = {0: document.body};
	const $virtualDom = document.getElementById('virtual-dom') as HTMLScriptElement;
	const virtualDom = JSON.parse($virtualDom.innerText);
	for (let i = 0; i < virtualDom.length; i++) {
		const rootNode = virtualDom[i];
		if (rootNode.type === 'TextNode') {
			_nodeMap[rootNode.id] = document.body.childNodes[i];
			// @debug
			if (!_nodeMap[rootNode.id] || _nodeMap[rootNode.id].nodeType !== Node.TEXT_NODE) {
				console.error('invalid', _nodeMap[rootNode.id]);
				alert('error, failed to hydrate dom (1)');
			}
		}
	}

	walk(virtualDom, node => {
		if (node.type !== 'ElementNode') {
			return;
		}

		const $node = document.querySelector(`[data-id='${node.id}']`) as HTMLElement;
		// @debug
		if (!$node && node.tag.toLowerCase() !== '!doctype') {
			console.error(node);
			console.error(node.id, $node);
			debugger;
			alert('error, failed to hydrate dom (2)');
		}

		// $node.removeAttribute('data-id'); // TODO enable this again later
		_nodeMap[node.id] = $node;
		for (let i = 0; i < node.children.length; i++) {
			const child = node.children[i];
			if (child.type === 'TextNode') {
				if (node.tag === 'html') {
					// TODO what is happening here?
					// TODO handle whitespace in html nodes / implicitly inserted nodes
					continue;
				}

				const $child = document.createTextNode(child.text);
				$node.replaceChild($child, $node.childNodes[i]);
				_nodeMap[child.id] = $child;
			}

			if (child.type === 'CommentNode') {
				const $child = document.createComment(child.text);
				$node.replaceChild($child, $node.childNodes[i]);
				_nodeMap[child.id] = $child;
			}
		}
	});
	return _nodeMap;
})();

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

type Command<K extends keyof RemoteCommandMap> = (payload: RemoteCommandMap[K]) => void;
const useCommand: <K extends keyof RemoteCommandMap>(fn: () => Command<K>) => Command<K> = fn =>
	fn();

export const error: Command<'error'> = useCommand(() => {
	return payload => {
		alert('error' + payload.message);
	};
});

export const highlight: Command<'highlight'> = useCommand(() => {
	let $highlightedNode: HTMLElement | undefined;
	let highlightTimeout: number | undefined;
	return payload => {
		const {id} = payload;
		const $node = nodeMap[id];
		addHighlight($node);
		// @debug
		// if ($highlightedNode) {
		// 	if ($node !== $highlightedNode) {
		// 		$highlightedNode.style.background = 'transparent';
		// 		$highlightedNode = undefined;
		// 	}

		// 	clearTimeout(highlightTimeout);
		// }

		// if ($highlightedNode !== $node) {
		// 	$highlightedNode = $node;
		// 	$highlightedNode!.scrollIntoView();
		// 	$node.style.background = 'dodgerblue';
		// }

		// highlightTimeout = setTimeout(() => {
		// 	$highlightedNode!.style.background = 'transparent';
		// 	$highlightedNode = undefined;
		// }, 1000);
	};
});

export const textReplace: Command<'textReplace'> = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as Comment;
		if ($node === undefined) {
			debugger;
		}

		$node.data = payload.text;
	};
});

export const attributeChange: Command<'attributeChange'> = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as HTMLElement;
		$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
	};
});

export const attributeAdd: Command<'attributeAdd'> = useCommand(() => {
	return payload => {
		// just forward the request because it does the same thing
		attributeChange(payload);
	};
});

export const attributeDelete: Command<'attributeDelete'> = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id] as HTMLElement;
		$node.removeAttribute(payload.attribute);
	};
});

export const elementDelete: Command<'elementDelete'> = useCommand(() => {
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

export const elementInsert: Command<'elementInsert'> = useCommand(() => {
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

export const redirect: Command<'redirect'> = useCommand(() => {
	return payload => {
		window.location.replace(payload.url);
	};
});
