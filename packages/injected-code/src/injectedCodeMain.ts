import * as core from './plugins/remote-plugin-core/core';
import * as error from './plugins/remote-plugin-error/error';
import * as highlight from './plugins/remote-plugin-highlight/highlight';

const messageHandlers = {
	...core,
	...error,
	...highlight
};

const webSocket = new WebSocket('ws://localhost:3000');

// const send = (message: object) => {
// 	const serializedMessage = JSON.stringify(message);
// 	webSocket.send(serializedMessage);
// };

webSocket.onmessage = ({data}) => {
	const {messages, id} = JSON.parse(data);
	for (const message of messages) {
		const {command, payload} = message;
		if (command in messageHandlers) {
			messageHandlers[command](payload);
		} else {
			// @debug
			alert({message: 'command does not exist'});
		}
	}

	if (messages.length === 1 && messages[0].command === 'error') {
	}
};
