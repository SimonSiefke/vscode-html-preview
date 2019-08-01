// @ts-nocheck

const ws = new WebSocket('ws://localhost:3001');
function getElementById(id) {
	return document.querySelector(`[data-brackets-id="${id}"]`);
}

const virtualDom = JSON.parse(document.getElementById('virtual-dom').innerText);

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

const nodeMap = {};

walk(virtualDom, node => {
	if (node.type !== 'ElementNode') {
		return;
	}

	const $node = document.querySelector(`[data-id='${node.id}']`);
	$node.removeAttribute('data-id');
	nodeMap[node.id] = $node;
	for (let i = 0; i < node.children.length; i++) {
		const child = node.children[i];
		if (child.type === 'TextNode') {
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

ws.onmessage = ({data}) => {
	const messages = JSON.parse(data);
	for (const message of messages) {
		const {command, payload} = message;
		if (command === 'textReplace') {
			const $node = nodeMap[payload.id];
			$node.data = payload.text;
			continue;
		}

		if (command === 'attributeAdd' || command === 'attributeChange') {
			const $node = nodeMap[payload.id];
			$node.setAttribute(payload.attribute, payload.value || '');
			continue;
		}

		if (command === 'attributeDelete') {
			const $node = nodeMap[payload.id];
			$node.removeAttribute(payload.attribute);
			continue;
		}

		if (command === 'elementDelete') {
			const $node = nodeMap[payload.id];
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
					$node.setAttribute(attributeName, payload.attributes[attributeName]);
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
			const $referenceNode = $parent.childNodes[payload.index];
			$parent.insertBefore($node, $referenceNode);
		}

		console.log(JSON.stringify(message));
		// Console.log(message.command)
		// console.log('else')
		// window.location.reload(true)
	}
};
