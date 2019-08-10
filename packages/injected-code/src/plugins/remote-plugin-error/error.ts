import {useCommand} from '../remotePluginApi';

export const error: RemotePluginError['error'] = useCommand(() => {
	return payload => {
		alert('error' + payload.message);
	};
});
