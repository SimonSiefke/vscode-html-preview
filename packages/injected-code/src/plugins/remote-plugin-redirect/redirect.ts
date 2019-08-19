import {RemotePlugin} from '../remotePluginApi';

export const redirect: RemotePlugin = api => {
	api.webSocket.onMessage('redirect', payload => {
		window.location.pathname = payload.url;
	});
};
