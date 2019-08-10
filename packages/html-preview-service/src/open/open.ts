import * as openInBrowser from 'open';

type Browser = 'default' | 'chrome' | 'firefox';

/**
 * Opens a url in a browser.
 * The currently supported browsers are:
 * - default
 * - chrome
 * - firefox
 */
export const open = (url: string, browser: string) => {
	let app: string | undefined;
	if (browser === 'default') {
		// do nothing special
	} else if (browser === 'chrome') {
		if (process.platform === 'darwin' || process.platform === 'linux') {
			app = 'google-chrome';
		} else {
			app = 'chrome';
		}
	} else if (browser === 'firefox') {
		app = 'firefox';
	} else {
		// @debug
		console.warn(`unknown browser ${browser}`);
	}

	return openInBrowser(url, {app});
};
