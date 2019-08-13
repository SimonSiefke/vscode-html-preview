import {RemotePlugin} from '../remotePluginApi';

export const connection: RemotePlugin = api => {
	api.webSocket.onMessage('connectionClosed', payload => {
		const overlay = document.createElement('div');
		const background = document.createElement('div');
		const status = document.createElement('div');
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.zIndex = '2227';
		overlay.style.position = 'fixed';
		overlay.style.top = '0';
		overlay.style.left = '0';

		background.style.backgroundColor = '#fff';
		background.style.opacity = '0.5';
		background.style.width = '100%';
		background.style.height = '100%';
		background.style.position = 'fixed';
		background.style.top = '0';
		background.style.left = '0';

		status.textContent = 'Html Preview Server has been closed';
		status.style.width = '100%';
		status.style.color = '#fff';
		status.style.backgroundColor = '#666';
		status.style.position = 'fixed';
		status.style.top = '0';
		status.style.left = '0';
		status.style.padding = '0.2em';
		status.style.verticalAlign = 'top';
		status.style.textAlign = 'center';
		overlay.appendChild(background);
		overlay.appendChild(status);
		document.body.appendChild(overlay);
		document.title = '(Html Preview: closed) ' + window.document.title;
	});
};
