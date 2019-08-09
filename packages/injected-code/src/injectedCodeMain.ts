import * as Commands from './Commands';
const ws = new WebSocket('ws://localhost:3001');

const send = (message: LocalCommandWebsocketMessage) => {
	const serializedMessage = JSON.stringify(message);
	ws.send(serializedMessage);
};

ws.onmessage = ({data}) => {
	const {messages, id} = JSON.parse(data);
	// console.clear();
	console.log(JSON.stringify(messages, null, 2));
	for (const message of messages) {
		const {command, payload} = message;
		if (command in Commands) {
			Commands[command](payload);
		} else {
			// @debug
			Commands.error({message: 'command does not exist'});
		}
	}

	if (messages.length === 1 && messages[0].command === 'error') {
		return;
	}

	const successMessage: LocalCommandWebsocketMessage = {
		command: 'success',
		payload: {},
		type: 'response',
		id
	};
	send(successMessage);
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

	const message: LocalCommandWebsocketMessage = {
		type: 'request',
		id: nextId(),
		command: 'highlight',
		payload: {
			id
		}
	};
	send(message);
});
