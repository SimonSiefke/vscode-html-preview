import {core} from './plugins/remote-plugin-core/core';
import {error} from './plugins/remote-plugin-error/error';
import {highlight} from './plugins/remote-plugin-highlight/highlight';
import {RemotePluginApi} from './plugins/remotePluginApi';

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

async function fetchNodeMap() {
	const nodeMap = {0: document.body};
	const virtualDom = await fetch('/virtual-dom.json').then(res => res.json());
	let topLevelElement: HTMLElement | Document = document;
	for (let i = 0; i < virtualDom.length; i++) {
		const rootNode = virtualDom[i];
		if (rootNode.type !== Node.DOCUMENT_NODE) {
			topLevelElement = document.body;
		}

		if (rootNode.type === 'TextNode') {
			nodeMap[rootNode.id] = topLevelElement.childNodes[i];
			// @debug
			if (!nodeMap[rootNode.id] || nodeMap[rootNode.id].nodeType !== Node.TEXT_NODE) {
				console.log('expected text node, got');
				console.error('invalid', nodeMap[rootNode.id]);
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
		nodeMap[node.id] = $node;
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
				nodeMap[child.id] = $child;
			}

			if (child.type === 'CommentNode') {
				const $child = document.createComment(child.text);
				$node.replaceChild($child, $node.childNodes[i]);
				nodeMap[child.id] = $child;
			}
		}
	});
	return nodeMap;
}

(async () => {
	const nodeMap = await fetchNodeMap();
	const webSocket = new WebSocket('ws://localhost:3000');
	webSocket.onmessage = ({data}) => {
		const {messages, id} = JSON.parse(data);
		console.log(JSON.stringify(messages, null, 2));
		for (const message of messages) {
			const {command, payload} = message;
			if (command in listeners) {
				listeners[command].forEach(listener => listener(payload));
			} else {
				// @debug
				alert({message: 'command does not exist'});
			}
		}

		if (messages.length === 1 && messages[0].command === 'error') {
		}
	};

	const listeners: {[key: string]: Array<(payload) => void>} = {};

	const remotePluginApi: RemotePluginApi = {
		nodeMap,
		webSocket: {
			onMessage(command, listener) {
				if (!listeners[command]) {
					listeners[command] = [];
				}

				listeners[command]!.push(listener);
			}
		}
	};

	core(remotePluginApi);
	error(remotePluginApi);
	highlight(remotePluginApi);
})();
