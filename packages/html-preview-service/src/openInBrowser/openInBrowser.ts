import * as open from 'open';

/**
 * Opens a url in a browser.
 *
 * The currently supported browsers are:
 * - default
 * - chrome
 * - firefox
 *
 * TODO egde browser
 * TODO safari browser
 * TODO sizzy
 * TODO blisk
 * TODO opera
 *
 * The currently no supported browsers are:
 * - brave, it opens with a vscode icon instead of a brave icon
 * - vivaldi, it opens with a vscode icon instead of a vivaldi icon
 *

 */
export const openInBrowser = (url: string, browser: string) => {
	let app: string | undefined;
	const args: string[] = [];
	if (browser === 'default') {
		// do nothing special, keeping app undefined means that it opens in a default browser
	} else if (browser === 'chrome') {
		if (process.platform === 'darwin' || process.platform === 'linux') {
			app = 'google-chrome';
		} else {
			app = 'chrome';
		}
	} else if (browser === 'firefox') {
		app = 'firefox';
	}
	// TODO brave not quite working
	// else if (browser === 'brave') {
	// 	app = 'brave-browser';
	// args.push('--no-default-browser-check');
	// }
	// TODO vivaldi not quite working
	// else if (browser === 'vivaldi') {
	// 	app = 'vivaldi';
	// }
	else {
		// @debug
		console.warn(`unknown browser ${browser}`);
	}

	const launchCommand = app ? [app, ...args] : app;
	return open(url, {
		app: launchCommand
	});
};
