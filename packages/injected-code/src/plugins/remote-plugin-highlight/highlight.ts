import {addHighlight} from './highlight-service/highlightServiceMain';
import {RemotePlugin} from '../remotePluginApi';

export const highlight: RemotePlugin = api => {
	api.webSocket.onMessage('highlight', payload => {
		const {id} = payload;
		const $node = api.nodeMap[id];
		addHighlight($node);
	});
};
