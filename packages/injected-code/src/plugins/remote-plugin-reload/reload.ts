import {RemotePlugin} from '../remotePluginApi';

export const reload: RemotePlugin = api => {
	api.webSocket.onMessage('reload', () => {
		window.location.reload();
	});
};
