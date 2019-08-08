import * as Commands from './Commands';
const ws = new WebSocket('ws://localhost:3001');

const nodeMap: {[key: number]: any} = {
	0: document.body
};

ws.onmessage = ({data}) => {
	const {messages, id} = JSON.parse(data);
	console.clear();
	console.log(JSON.stringify(messages, null, 2));
	for (const message of messages) {
		const {command, payload} = message;
		if (command in Commands) {
			Commands[command](payload);
		} else {
			// @debug
			Commands.error('command does not exist');
		}
	}

	if (messages.length === 1 && messages[0].command === 'error') {
		return;
	}

	// console.log(messages);
	ws.send(JSON.stringify({success: true, id, type: 'response'}));
};

const nextId = (() => {
	let id = 0;
	return () => id++;
})();

window.addEventListener('click', event => {
	// @ts-ignore
	const id = parseInt((event.target as HTMLElement).dataset.id, 10);
	if (!id) {
		console.error('no id for', event.target);
		return;
	}

	const message = {
		type: 'request',
		id: nextId(),
		message: {
			command: 'highlight',
			payload: {
				id
			}
		}
	};
	ws.send(JSON.stringify(message));
});
