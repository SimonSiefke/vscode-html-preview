const ws = new WebSocket('ws://localhost:3001');
function getElementById(id) {
	return document.querySelector(`[data-brackets-id="${id}"]`);
}

const $virtualDom = document.getElementById('virtual-dom') as HTMLScriptElement;
const virtualDom = JSON.parse($virtualDom.innerText);

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

const nodeMap = {
	0: document.body
};

for (let i = 0; i < virtualDom.length; i++) {
	const rootNode = virtualDom[i];
	if (rootNode.type === 'TextNode') {
		nodeMap[rootNode.id] = document.body.childNodes[i];
	}
}

console.log(virtualDom);

walk(virtualDom, node => {
	if (node.type !== 'ElementNode') {
		return;
	}

	const $node = document.querySelector(`[data-id='${node.id}']`) as HTMLElement;
	if (!$node) {
		console.log(node);
		console.log(node.id, $node);
	}

	// $node.removeAttribute('data-id');
	nodeMap[node.id] = $node;
	for (let i = 0; i < node.children.length; i++) {
		const child = node.children[i];
		if (child.type === 'TextNode') {
			if (node.tag === 'html') {
				console.log('continue');
				// TODO handle whitespace in html nodes / implicitly inserted nodes
				continue;
			}

			const $child = document.createTextNode(child.text);
			$node.replaceChild($child, $node.childNodes[i]);
			nodeMap[child.id] = $child;
		}

		if (child.type === 'CommentNode') {
			const $child = document.createComment(child.text);
			$node.replaceChild($child, $node.childNodes[i]);
			nodeMap[child.id] = $child;
		}
	}
});

console.log(nodeMap);

function fixAttributeValue(value) {
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

ws.onmessage = ({data}) => {
	const messages = JSON.parse(data);
	console.log(JSON.stringify(messages, null, 2));
	for (const message of messages) {
		const {command, payload} = message;
		if (command === 'error') {
			alert('error' + payload);
			continue;
		}

		if (command === 'textReplace') {
			const $node = nodeMap[payload.id];
			if ($node === undefined) {
				debugger;
			}

			$node.data = payload.text;
			continue;
		}

		if (command === 'attributeAdd' || command === 'attributeChange') {
			const $node = nodeMap[payload.id];
			$node.setAttribute(payload.attribute, fixAttributeValue(payload.value));
			continue;
		}

		if (command === 'attributeDelete') {
			const $node = nodeMap[payload.id];
			$node.removeAttribute(payload.attribute);
			continue;
		}

		if (command === 'elementDelete') {
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

			continue;
		}

		if (command === 'elementInsert') {
			let $node;
			if (payload.nodeType === 'ElementNode') {
				$node = document.createElement(payload.tag);
				for (const attributeName of Object.keys(payload.attributes)) {
					$node.setAttribute(
						attributeName,
						fixAttributeValue(payload.attributes[attributeName])
					);
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
		}

		console.log(JSON.stringify(message));
		// Console.log(message.command)
		// console.log('else')
		// window.location.reload(true)
	}
};
