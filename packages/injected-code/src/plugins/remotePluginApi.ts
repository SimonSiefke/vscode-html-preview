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

export const nodeMap: {[key: number]: HTMLElement | Text | Comment} = (() => {
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

// export type Command<K extends keyof RemoteCommandMap> = (payload: RemoteCommandMap[K]) => void;
export const useCommand: <T>(fn: () => T) => T = fn => fn();
