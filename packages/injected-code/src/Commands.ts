import {addHighlight} from './highlight/highlight';

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

const nodeMap: {[key: number]: any} = (() => {
	const _nodeMap = {0: document.body};
	const $virtualDom = document.getElementById('virtual-dom') as HTMLScriptElement;
	const virtualDom = JSON.parse($virtualDom.innerText);
	for (let i = 0; i < virtualDom.length; i++) {
		const rootNode = virtualDom[i];
		if (rootNode.type === 'TextNode') {
			_nodeMap[rootNode.id] = document.documentElement.childNodes[i];
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

type Command = (payload: any) => void;
const useCommand = (fn: () => Command) => fn();

export const error: Command = useCommand(() => {
	return payload => {
		alert('error' + payload);
	};
});

export const highlight: Command = useCommand(() => {
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

export const textReplace: Command = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id];
		if ($node === undefined) {
			debugger;
		}

		$node.data = payload.text;
	};
});

export const attributeChange: Command = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id];
		$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
	};
});

export const attributeAdd: Command = useCommand(() => {
	return payload => {
		attributeChange(payload);
	};
});

export const attributeDelete: Command = useCommand(() => {
	return payload => {
		const $node = nodeMap[payload.id];
		$node.removeAttribute(payload.attribute);
	};
});

export const elementDelete: Command = useCommand(() => {
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

export const elementInsert: Command = useCommand(() => {
	return payload => {
		let $node;
		if (payload.nodeType === 'ElementNode') {
			$node = document.createElement(payload.tag);
			for (const attributeName of Object.keys(payload.attributes)) {
				$node.setAttribute(attributeName, fixAttributeValue(payload.attributes[attributeName]));
			}
		} else if (payload.nodeType === 'TextNode') {
			$node = document.createTextNode(payload.text);
		} else if (payload.nodeType === 'ElementNode') {
			$node = document.createComment(payload.text);
		} else {
			throw new Error('invalid node type');
		}

		nodeMap[payload.id] = $node;
		const $parent = nodeMap[payload.parentId];
		if (!$parent) {
			debugger;
		}

		if (payload.index === -1) {
			$parent.prepend($node);
		} else {
			const $referenceNode = $parent.childNodes[payload.index + 1];
			$parent.insertBefore($node, $referenceNode);
		}
	};
});

export const redirect: Command = useCommand(() => {
	return payload => {
		window.location.replace(payload);
	};
});
