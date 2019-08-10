import * as openInBrowser from 'open';

export const open = async (url: string) => {
	await openInBrowser(url);
};
