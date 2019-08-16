import {openInBrowser} from 'html-preview-service';
import * as vscode from 'vscode';

export async function open() {
	const browser = vscode.workspace.getConfiguration().get<string>('htmlPreview.browser');
	if (process.env.NODE_ENV !== 'test') {
		await openInBrowser('http://localhost:3000', browser);
	}
}
