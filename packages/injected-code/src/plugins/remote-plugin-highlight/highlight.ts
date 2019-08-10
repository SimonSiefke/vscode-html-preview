import {useCommand, nodeMap} from '../remotePluginApi';
import {addHighlight} from './highlight-service/highlightServiceMain';

export const highlight: RemotePluginHighlight['highlight'] = useCommand(() => {
	return payload => {
		const {id} = payload;
		const $node = nodeMap[id];
		addHighlight($node);
	};
});
