import {RemotePlugin} from '../remotePluginApi';

export const error: RemotePlugin = api => {
	api.webSocket.onMessage('error', payload => {
		alert('error' + payload.message);
	});
};
