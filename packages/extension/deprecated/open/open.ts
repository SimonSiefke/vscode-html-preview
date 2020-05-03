import {openInVscode} from './open-in-vscode/openInVscode';
import {openInBrowser} from './open-in-browser/openInBrowser';
import * as vscode from 'vscode';

/**
 * gets the `/index.html` path of `file://some/folder/index.html` where `folder` is the current workspace folder.
 */
const getRelativePath = (uri?: vscode.Uri) => {
	if (uri) {
		return vscode.workspace.asRelativePath(uri);
	}

	const {activeTextEditor} = vscode.window;
	if (activeTextEditor) {
		return vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri);
	}

	return 'index.html';
};

export const open = ({uri}: {uri?: vscode.Uri}) => {
	if (process.env.NODE_ENV === 'test') {
		return;
	}

	const relativePath = getRelativePath(uri);
	const application = vscode.workspace
		.getConfiguration()
		.get<'vscode' | 'browser'>('htmlPreview.openWith');

	switch (application) {
		case 'vscode':
			return openInVscode({relativePath});
			break;
		case 'browser':
			return openInBrowser({relativePath});
			break;
		default:
			throw new Error('invalid application');
	}
};
